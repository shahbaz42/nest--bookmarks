import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { RestaurantDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { SchemaFieldTypes, createClient } from 'redis';

/**
 * Service responsible for handling restaurant-related operations.
 */
@Injectable()
export class RestaurantsService {
  private client: any;

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    // create a redis client
    this.client = createClient();
    this.client.on('error', (error) => {
      console.error(error);
    });
    this.client.on('connect', () => {
      console.log('connected');
    });

    this.client.connect();

    // create schema for restaurant search
    (async () => {
      try {
        await this.client.ft.create(
          'idx:restaurant',
          {
            '$.name': {
              type: SchemaFieldTypes.TEXT,
              SORTABLE: true,
            },
            '$.location': {
              type: SchemaFieldTypes.TEXT,
              AS: 'location',
            },
            '$.description': {
              type: SchemaFieldTypes.TEXT,
              AS: 'description',
            },
          },
          {
            ON: 'JSON',
            PREFIX: 'restaurant',
          },
        );
      } catch (error) {
        if (error.message === 'Index already exists') {
          console.log('Index already exists, skipping creation');
        } else {
          console.log(error);
        }
      }

      // cache all restaurants
      const restaurants = await this.prisma.restaurant.findMany();

      await Promise.all(
        restaurants.map(async (restaurant) => {
          await this.client.json.set(`restaurant:${restaurant.id}`, '$', {
            name: restaurant.name,
            description: restaurant.description,
            location: restaurant.location,
          });
        }),
      );

      console.log('cached all restaurants');
    })();
  }

  /**
   * Retrieves all restaurants from the database.
   * @returns A promise that resolves to an array of restaurants.
   */
  async getAllRestaurants() {
    const restaurants = await this.prisma.restaurant.findMany();
    return restaurants;
  }

  /**
   * Adds a new restaurant to the database.
   * @param dto - The data transfer object containing the restaurant details.
   * @returns A promise that resolves to the newly created restaurant.
   */
  async addRestaurant(dto: RestaurantDto) {
    const { name, description, location } = dto;

    // saving the restaurant in db
    const restaurant = await this.prisma.restaurant.create({
      data: {
        name,
        description,
        location,
      },
    });

    // cache the newly created restaurant
    await this.client.json.set(`restaurant:${restaurant.id}`, '$', {
      name: restaurant.name,
      description: restaurant.description,
      location: restaurant.location,
    });

    return restaurant;
  }

  /**
   * Updates an existing restaurant in the database.
   * @param dto - The data transfer object containing the updated restaurant details.
   * @param id - The ID of the restaurant to be updated.
   * @returns A promise that resolves to the updated restaurant.
   * @throws NotFoundException if the restaurant with the specified ID is not found.
   */
  async updateRestaurant(dto: RestaurantDto, id: string) {
    const { name, description, location } = dto;

    try {
      const restaurant = await this.prisma.restaurant.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          description,
          location,
        },
      });

      // cache the updated restaurant
      await this.client.json.set(`restaurant:${restaurant.id}`, '$', {
        name: restaurant.name,
        description: restaurant.description,
        location: restaurant.location,
      });

      return restaurant;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Restaurant with id ${id} not found`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Performs a search for restaurants based on the specified criteria.
   * @param searchBy - The field to search by (name and location).
   * @param searchValue - The value to search for.
   * @returns A promise that resolves to an array of restaurants matching the search criteria.
   */
  async searchRestaurants(searchBy: string, searchValue: string) {
    // search restaurants in redis
    const results = await this.client.ft.search(
      'idx:restaurant',
      `@${searchBy}:${searchValue}*`,
    );

    return results.documents.map((document) => {
      return {
        id: document.id,
        ...document.value,
      };
    });
  }
}

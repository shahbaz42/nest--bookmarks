import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { RestaurantDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Service responsible for handling restaurant-related operations.
 */
@Injectable()
export class RestaurantsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * Retrieves all restaurants from the database.
   * @returns A promise that resolves to an array of restaurants.
   */
  async getAllRestaurants() {
    const restaurants =
      await this.prisma.restaurant.findMany();
    return restaurants;
  }

  /**
   * Adds a new restaurant to the database.
   * @param dto - The data transfer object containing the restaurant details.
   * @returns A promise that resolves to the newly created restaurant.
   */
  async addRestaurant(dto: RestaurantDto) {
    const { name, description, location } = dto;

    const restaurant =
      await this.prisma.restaurant.create({
        data: {
          name,
          description,
          location,
        },
      });

    await this.cacheManager.reset(); // clear cache

    return restaurant;
  }

  /**
   * Updates an existing restaurant in the database.
   * @param dto - The data transfer object containing the updated restaurant details.
   * @param id - The ID of the restaurant to be updated.
   * @returns A promise that resolves to the updated restaurant.
   * @throws NotFoundException if the restaurant with the specified ID is not found.
   */
  async updateRestaurant(
    dto: RestaurantDto,
    id: string,
  ) {
    const { name, description, location } = dto;

    try {
      const restaurant =
        await this.prisma.restaurant.update({
          where: {
            id: Number(id),
          },
          data: {
            name,
            description,
            location,
          },
        });

      await this.cacheManager.reset(); // clear cache

      return restaurant;
    } catch (error) {
      if (
        error instanceof
          PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Restaurant with id ${id} not found`,
        );
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
  async searchRestaurants(
    searchBy: string,
    searchValue: string,
  ) {
    const cachedValue =
      await this.cacheManager.get(
        `${searchBy}:${searchValue}`,
      );
    if (cachedValue) {
      // console.log('cache hit');  <--- uncomment this line to see cache hit in action
      return cachedValue;
    } else {
      // console.log('cache miss');     <--- uncomment this line to see cache miss in action

      const restaurants =
        await this.prisma.restaurant.findMany({
          where: {
            [searchBy]: {
              contains: searchValue,
              mode: 'insensitive',
            },
          },
        });

      await new Promise((resolve) =>
        setTimeout(resolve, 2000),
      ); // simulate 2-second delay

      await this.cacheManager.set(
        `${searchBy}:${searchValue}`,
        restaurants,
        0, // never expire
      );
      return restaurants;
    }
  }
}

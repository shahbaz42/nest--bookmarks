import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RestaurantDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Service responsible for handling restaurant-related operations.
 */
@Injectable()
export class RestaurantsService {
    constructor(private prisma: PrismaService) {}

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
     * Performs a search for restaurants.
     * @param searchBy - The field to search by (e.g., name, description, location).
     * @param searchValue - The value to search for.
     * @returns A promise that resolves to an array of restaurants matching the search criteria.
     */
    async searchRestaurants(searchBy: string, searchValue: string) {
        const restaurants =
            await this.prisma.restaurant.findMany({
                where: {
                    [searchBy]: {
                        contains: searchValue,
                        mode: 'insensitive',
                    },
                },
            });
        return restaurants;
    }
}

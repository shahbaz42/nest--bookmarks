import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantDto, RestaurantSearchDto } from './dto';

/**
 * Controller for handling restaurant-related requests.
 */
@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantService: RestaurantsService) {}

  /**
   * Get all restaurants.
   * @returns {Promise<Restaurant[]>} A promise that resolves to an array of restaurants.
   */
  @Get('')
  getAllRestaurants() {
    return this.restaurantService.getAllRestaurants();
  }

  /**
   * Add a new restaurant.
   * @param {RestaurantDto} dto - The restaurant data.
   * @returns {Promise<Restaurant>} A promise that resolves to the added restaurant.
   */
  @Post('')
  addRestaurant(@Body() dto: RestaurantDto) {
    return this.restaurantService.addRestaurant(dto);
  }

  /**
   * Search restaurants based on search criteria.
   * @param {string} searchBy - The field to search by.
   * @param {string} searchValue - The value to search for.
   * @returns {Promise<Restaurant[]>} A promise that resolves to an array of matching restaurants.
   */
  // ...

  @Get('/search')
  searchRestaurants(@Query() searchDto: RestaurantSearchDto) {
    return this.restaurantService.searchRestaurants(
      searchDto.searchBy,
      searchDto.searchValue,
    );
  }

  /**
   * Update a restaurant.
   * @param {RestaurantDto} dto - The updated restaurant data.
   * @param {string} id - The ID of the restaurant to update.
   * @returns {Promise<Restaurant>} A promise that resolves to the updated restaurant.
   */
  @Put('/:id')
  updateRestaurant(@Body() dto: RestaurantDto, @Param('id') id: string) {
    return this.restaurantService.updateRestaurant(dto, id);
  }
}

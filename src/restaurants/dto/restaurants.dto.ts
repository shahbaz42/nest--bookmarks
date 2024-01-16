import { IsIn, IsNotEmpty, IsString } from 'class-validator';

/**
 * Represents a restaurant data transfer object.
 */
export class RestaurantDto {
  /**
   * The name of the restaurant.
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The location of the restaurant.
   */
  @IsString()
  @IsNotEmpty()
  location: string;

  /**
   * The description of the restaurant.
   */
  @IsString()
  description: string;
}

export class RestaurantSearchDto {
  /**
   * The field to search by can only be one of the following: name, location.
   */
  @IsString()
  @IsNotEmpty()
  @IsIn(['name', 'location'])
  searchBy: string;

  /**
   * The value to search for.
   */
  @IsString()
  @IsNotEmpty()
  searchValue: string;
}

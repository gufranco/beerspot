import NodeGeocoder, { Geocoder, Entry } from 'node-geocoder';
import { Service } from 'typedi';
import { GeoPosition } from '../interfaces/GeocodeInterface';

export type UnitType = 'km' | 'mi';

@Service()
export default class LocationHelper {
  private geocoder: Geocoder;

  constructor() {
    this.geocoder = NodeGeocoder({
      provider: 'openstreetmap',
      httpAdapter: 'https',
    });
  }

  public async getPosition(
    street: string,
    number: number,
    neighborhood: string,
    zipCode: string,
  ): Promise<GeoPosition> {
    const results: Entry[] = await this.geocoder.geocode(
      `${street}, ${number} - ${neighborhood}`,
    );

    if (!results.length) {
      throw new Error("The location for this given address wasn't found");
    }

    const locations: GeoPosition[] = results
      .filter(
        (result: Entry) =>
          typeof result.zipcode === 'string' &&
          typeof result.latitude === 'number' &&
          typeof result.longitude === 'number' &&
          zipCode === result.zipcode.replace(/\D/g, ''),
      )
      .map((result) => ({
        latitude: <number>result.latitude,
        longitude: <number>result.longitude,
      }));

    if (!locations.length) {
      throw new Error("The location for this given address wasn't found");
    }

    return locations.reduce(
      (
        previousValue: GeoPosition,
        currentValue: GeoPosition,
        index: number,
        positions: GeoPosition[],
      ): GeoPosition => {
        const position: GeoPosition = {
          latitude: previousValue.latitude + currentValue.latitude,
          longitude: previousValue.longitude + currentValue.longitude,
        };

        if (index === positions.length - 1) {
          return {
            latitude: Number((position.latitude / positions.length).toFixed(7)),
            longitude: Number(
              (position.longitude / positions.length).toFixed(7),
            ),
          };
        }

        return position;
      },
      {
        latitude: 0,
        longitude: 0,
      },
    );
  }

  private degreesToRadians(degrees: number) {
    return degrees * 0.017453292519943295;
  }

  private async getDistance(
    firstPosition: GeoPosition,
    secondPosition: GeoPosition,
    unit: UnitType = 'km',
  ): Promise<number> {
    const deltaLatitude: number = this.degreesToRadians(
      secondPosition.latitude - firstPosition.latitude,
    );
    const deltaLongitude: number = this.degreesToRadians(
      secondPosition.longitude - firstPosition.longitude,
    );
    const radiansFirstLatitude: number = this.degreesToRadians(
      firstPosition.latitude,
    );
    const radiansSecondLatitude: number = this.degreesToRadians(
      secondPosition.latitude,
    );
    const result: number =
      2 *
      Math.atan2(
        Math.sqrt(
          Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
            Math.sin(deltaLongitude / 2) *
              Math.sin(deltaLongitude / 2) *
              Math.cos(radiansFirstLatitude) *
              Math.cos(radiansSecondLatitude),
        ),
        Math.sqrt(
          1 -
            Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
            Math.sin(deltaLongitude / 2) *
              Math.sin(deltaLongitude / 2) *
              Math.cos(radiansFirstLatitude) *
              Math.cos(radiansSecondLatitude),
        ),
      );

    if (unit === 'km') {
      return result * 6371;
    }

    return result * 3956;
  }

  public async isInsideCoverageArea(
    customerPosition: GeoPosition,
    providerPosition: GeoPosition,
    coverageDistance: number,
  ): Promise<boolean> {
    const distance: number = await this.getDistance(
      customerPosition,
      providerPosition,
    );

    return distance <= coverageDistance;
  }
}

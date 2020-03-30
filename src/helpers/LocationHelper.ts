import NodeGeocoder, { Geocoder, Entry } from 'node-geocoder';
import { Service } from 'typedi';
import { GeoLocation } from '../interfaces/GeoLocationInterface';

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
    neighborhood: string
  ): Promise<GeoLocation> {
    const results: Entry[] = await this.geocoder.geocode(
      `${street}, ${number} - ${neighborhood}`,
    );

    if (!results.length) {
      throw new Error("The location for this given address wasn't found");
    }

    const locations: GeoLocation[] = results
      .filter(
        (result: Entry) =>
          typeof result.latitude === 'number' &&
          typeof result.longitude === 'number',
      )
      .map((result) => ({
        latitude: <number>result.latitude,
        longitude: <number>result.longitude,
      }));

    if (!locations.length) {
      throw new Error("The location for this given address wasn't found");
    }

    if (locations.length === 1) {
      return locations[0];
    }

    return locations.reduce(
      (
        previousValue: GeoLocation,
        currentValue: GeoLocation,
        index: number,
        locations: GeoLocation[],
      ): GeoLocation => {
        const position: GeoLocation = {
          latitude: previousValue.latitude + currentValue.latitude,
          longitude: previousValue.longitude + currentValue.longitude,
        };

        if (index === locations.length - 1) {
          return {
            latitude: Number((position.latitude / locations.length).toFixed(7)),
            longitude: Number(
              (position.longitude / locations.length).toFixed(7),
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
    firstPosition: GeoLocation,
    secondPosition: GeoLocation,
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
    customerPosition: GeoLocation,
    providerPosition: GeoLocation,
    coverageDistance: number,
  ): Promise<boolean> {
    const distance: number = await this.getDistance(
      customerPosition,
      providerPosition,
    );

    return distance <= coverageDistance;
  }
}

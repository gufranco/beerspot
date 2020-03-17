import NodeGeocoder, { Geocoder, Entry } from 'node-geocoder';
import { Service, Inject } from 'typedi';
import { NotFoundError } from 'routing-controllers';
import EnvironmentHelper from './EnvironmentHelper';
import { GeoPosition } from '../interfaces/GeocodeInterface';

@Service()
export default class LocationHelper {
  @Inject()
  private environmentHelper!: EnvironmentHelper;

  private geocoder: Geocoder;

  constructor() {
    this.geocoder = NodeGeocoder({
      provider: 'openstreetmap',
      email: this.environmentHelper.getEmailContact(),
      httpAdapter: 'https',
      formatter: null,
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

    return results
      .filter(
        (result) =>
          typeof result.zipcode === 'string' &&
          typeof result.latitude === 'number' &&
          typeof result.longitude === 'number' &&
          zipCode === result.zipcode.replace(/\d/g, ''),
      )
      .map((result) => ({
        latitude: <number>result.latitude,
        longitude: <number>result.longitude,
      }))
      .reduce(
        (previousValue, currentValue, index, positions): GeoPosition => {
          const position: GeoPosition = {
            latitude: previousValue.latitude + currentValue.latitude,
            longitude: previousValue.longitude + currentValue.longitude,
          };

          if (index === positions.length - 1) {
            return {
              latitude: position.latitude / positions.length,
              longitude: position.longitude / positions.length,
            };
          }

          return position;
        },
        { latitude: 0, longitude: 0 },
      );
  }

  private async getDistance(
    firstPosition: GeoPosition,
    secondPosition: GeoPosition,
  ): Promise<number> {
    return (
      6371 *
      2 *
      Math.atan2(
        Math.sqrt(
          Math.sin(
            ((secondPosition.latitude - firstPosition.latitude) * Math.PI) /
              180 /
              2,
          ) *
            Math.sin(
              ((secondPosition.latitude - firstPosition.latitude) * Math.PI) /
                180 /
                2,
            ) +
            Math.sin(
              ((secondPosition.longitude - firstPosition.longitude) * Math.PI) /
                180 /
                2,
            ) *
              Math.sin(
                ((secondPosition.longitude - firstPosition.longitude) *
                  Math.PI) /
                  180 /
                  2,
              ) *
              Math.cos((firstPosition.latitude * Math.PI) / 180) *
              Math.cos((secondPosition.latitude * Math.PI) / 180),
        ),
        Math.sqrt(
          1 -
            Math.sin(
              ((secondPosition.latitude - firstPosition.latitude) * Math.PI) /
                180 /
                2,
            ) *
              Math.sin(
                ((secondPosition.latitude - firstPosition.latitude) * Math.PI) /
                  180 /
                  2,
              ) +
            Math.sin(
              ((secondPosition.longitude - firstPosition.longitude) * Math.PI) /
                180 /
                2,
            ) *
              Math.sin(
                ((secondPosition.longitude - firstPosition.longitude) *
                  Math.PI) /
                  180 /
                  2,
              ) *
              Math.cos((firstPosition.latitude * Math.PI) / 180) *
              Math.cos((secondPosition.latitude * Math.PI) / 180),
        ),
      )
    );
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

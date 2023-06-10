import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MapService {
  async getCoordinates(
    address: string,
  ): Promise<{ latitude: number; longitude: number }> {
    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/search/address.json',
      {
        params: { query: address },
        headers: {
          Authorization: process.env.KAKAO_MAP_KEY,
        },
      },
    );

    const { documents } = response.data;
    if (documents.length > 0) {
      const { latitude, longitude } = documents[0];
      return { latitude, longitude };
    }

    throw new Error('주소를 찾을 수 없습니다.');
  }
}

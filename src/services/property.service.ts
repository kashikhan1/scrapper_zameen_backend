import { Service } from 'typedi';
import { QueryTypes } from 'sequelize';
import { sequelize } from '@config/sequelize';

@Service()
export class PropertyService {
  public async findAllProperties(page_size: number = 10, page_number: number): Promise<any> {
    const offset = (page_number - 1) * page_size;
    const properties = await sequelize.query(`SELECT * FROM property_v2 LIMIT :page_size OFFSET :offset`, {
      type: QueryTypes.SELECT,
      replacements: { page_size, offset },
    });
    return properties;
  }
  public async findPropertyById(propertyId: number) {
    return await sequelize.query(`SELECT * FROM property_v2 WHERE id = :propertyId`, {
      type: QueryTypes.SELECT,
      replacements: { propertyId },
    });
  }
}

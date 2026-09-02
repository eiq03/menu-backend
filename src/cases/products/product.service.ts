import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { CreateProductDto } from './dto/create-product';
import { UpdateProductDto } from './dto/update-product';
import { Injectable } from '@nestjs/common';
import { Category } from '../categories/category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productRepository.find({
      order: { name: 'ASC' },
      relations: { category: true },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const category = dto.categoryId ? await this.getActiveCategory(dto.categoryId) : null;

    const product = this.productRepository.create({
      name: dto.name.trim(),
      description: dto.description,
      price: dto.price,
      picture: dto.picture,
      active: true,
      category,
    });

    return this.productRepository.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.name !== undefined) {
      product.name = dto.name;
    }

    if (dto.active !== undefined) {
      product.active = dto.active;
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    await this.productRepository.remove(product);
  }

  private async getActiveCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({
      id,
      active: true,
    });

    if (!category) {
      throw new NotFoundException('Nenhuma Categoria ativa encontrada');
    } else {
      return category;
    }
  }
}

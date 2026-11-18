import { QueryFailedError, Repository } from "typeorm";
import { Product } from "./product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Category } from "../categories/category.entity";
import { CreateProductDto } from "./dto/create-product";
import { UpdateProductDto } from "./dto/update-product";

@Injectable()
export class ProductService {

    constructor( 
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product> 
    ) {} 

    // includeInactive: usado pelo CMS para listar também os produtos inativos
    findAll(categoryId?: string, includeInactive?: boolean): Promise<Product[]> {
        return this.productRepository.find({
            where: {
                ...(!includeInactive && { active: true }),
                ...(categoryId && { category: { id: categoryId } })
            },
            order: { name: 'ASC' },
            relations: { category: true }
        });
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({ 
            where: { id },
            relations: { category: true }
         });
 
        if (!product) {
            throw new NotFoundException(`Product with id ${id} not found`);
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
            vegetarian: dto.vegetarian,
            isNew: dto.isNew,
            active: true,
            category
        });

        return this.productRepository.save(product);
    }

    async update(id: string, dto: UpdateProductDto ): Promise<Product> {
        const product = await this.findOne(id);

        if (dto.name !== undefined) {
           product.name = dto.name;
        };

        if (dto.description !== undefined) {
           product.description = dto.description;
        };

        if (dto.price !== undefined) {
           product.price = dto.price;
        };

        if (dto.picture !== undefined) {
           product.picture = dto.picture;
        };

        if (dto.active !== undefined) {
           product.active = dto.active;
        };

        if (dto.vegetarian !== undefined) {
           product.vegetarian = dto.vegetarian;
        };

        if (dto.isNew !== undefined) {
           product.isNew = dto.isNew;
        };

        if (dto.categoryId !== undefined) {
          product.category = dto.categoryId ? await this.getActiveCategory(dto.categoryId) : null;
        };

        return this.productRepository.save(product);
    }

    

    async remove(id: string): Promise<void> {
        const product = await this.findOne(id);

        try {
            await this.productRepository.remove(product);
        } catch (error) {
            // 23503 = chave estrangeira: produto já está em algum pedido
            if (error instanceof QueryFailedError && (error.driverError as any).code === '23503') {
                throw new ConflictException('Product is linked to orders and cannot be removed');
            }
            throw error;
        }
    }

    private async getActiveCategory(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOneBy({
             id, 
             active: true 
            });

            if (!category) {
                throw new NotFoundException(`Active category with id ${id} not found`);
            }

        return category;
    }

}
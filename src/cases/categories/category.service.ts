import { QueryFailedError, Repository } from "typeorm";
import { Category } from "./category.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category";
import { UpdateCategoryDto } from "./dto/update-category";

@Injectable()
export class CategoryService {

    constructor( 
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category> 
    ) {} 

    findAll(): Promise<Category[]> {
        return this.categoryRepository.find({
            order: { displayOrder: 'ASC', name: 'ASC' }
        });
    }

    async findOne(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOneBy({ id });
 
        if (!category) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }

        return category;
    }

    create(dto: CreateCategoryDto): Promise<Category> {

        const category = this.categoryRepository.create({
            ...dto,
            name: dto.name,
            active: true
        });

        return this.categoryRepository.save(category);

    }

    async update(id: string, dto: UpdateCategoryDto ): Promise<Category> {
        const category = await this.findOne(id);

        if (dto.name !== undefined) {
           category.name = dto.name;
        };

        if (dto.active !== undefined) {
           category.active = dto.active;
        };

        if (dto.icon !== undefined) {
           category.icon = dto.icon;
        };

        if (dto.displayOrder !== undefined) {
           category.displayOrder = dto.displayOrder;
        };


        return this.categoryRepository.save(category);
    }

    

    async remove(id: string): Promise<void> {
        const category = await this.findOne(id);

        try {
            await this.categoryRepository.remove(category);
        } catch (error) {
            // 23503 = chave estrangeira: categoria ainda tem produtos vinculados
            if (error instanceof QueryFailedError && (error.driverError as any).code === '23503') {
                throw new ConflictException('Category has linked products and cannot be removed');
            }
            throw error;
        }
    }

}
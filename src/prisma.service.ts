import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  get like() {
    return this.prisma.like;
  }

  get post() {
    return this.prisma.post;
  }

  get comment() {
    return this.prisma.comment;
  }

  get board() {
    return this.prisma.board;
  }

  get review() {
    return this.prisma.review;
  }

  get client() {
    return this.prisma;
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  get user() {
    return this.prisma.user;
  }
}

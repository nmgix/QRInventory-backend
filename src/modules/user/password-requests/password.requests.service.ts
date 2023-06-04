import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Institution } from "modules/institution/institution.entity";
import { Repository } from "typeorm";
import { PasswordRequestTicket } from "./ticket.entity";
import * as dayjs from "dayjs";

@Injectable()
export class PasswordRequestsService {
  constructor(
    @InjectRepository(PasswordRequestTicket)
    private passwordRequestTicketRepository: Repository<PasswordRequestTicket>,

    @InjectRepository(Institution)
    private institutionRepository: Repository<Institution>
  ) {}

  async getAllInstitutionTickets(institutionId: string) {
    return this.passwordRequestTicketRepository.findAndCount({
      where: { institution: { id: institutionId } }
    });
  }

  async getTicket(institutionId: string, ticketId?: string, email?: string) {
    return this.passwordRequestTicketRepository.findOne({
      where: { id: ticketId, email, institution: { id: institutionId } }
    });
  }

  async createTicket(email: string, institutionId: string) {
    const institution = await this.institutionRepository.findOne({ where: { id: institutionId } });
    const date = dayjs().format();
    const ticket = this.passwordRequestTicketRepository.create({
      email,
      institution,
      created_date: date
    });
    return this.passwordRequestTicketRepository.save(ticket);
  }

  async deleteTicket(ticketId: string) {
    return this.passwordRequestTicketRepository.delete({ id: ticketId });
  }
}

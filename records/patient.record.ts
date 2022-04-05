import {pool} from "../utils/db";
import {FieldPacket} from "mysql2";
import {v4 as uuid} from "uuid";
import {ValidationError} from "../utils/error";


type PatientResults = [PatientRecord[], FieldPacket[]];

export class PatientRecord {
    id: string;
    name: string;
    lastName: string;
    vaccinationId: string;

    constructor(obj: Omit<PatientRecord, 'insert'>) {

        if (!obj.name || obj.name.length < 3 || obj.name.length > 30) {
            throw new ValidationError('Imię pacjenta musi mieć od 3 do 30 znaków.')
        }

        if (!obj.lastName || obj.lastName.length < 3 || obj.lastName.length > 50) {
            throw new ValidationError('Nazwisko pacjenta musi mieć od 3 do 50 znaków.')
        }
        this.id = obj.id;
        this.name = obj.name;
        this.lastName = obj.lastName;
        this.vaccinationId = obj.vaccinationId;
    }

    async insert(): Promise<string> {
        if (!this.id) {
            this.id = uuid();
        }

        await pool.execute('INSERT INTO `patients`(`id`,`name`,`lastName`) VALUES(:id, :name, :lastName)', {
            id: this.id,
            name: this.name,
            lastName: this.lastName,
        })

        return this.id;
    }

    async update(): Promise<void> {

        await pool.execute('UPDATE `patients` SET `name`=:name, `lastName`=:lastName, `vaccinationId`=:vaccinationId WHERE `id`=:id', {
            id: this.id,
            name: this.name,
            lastName: this.lastName,
            vaccinationId: this.vaccinationId,
        })

    }

    static async listAll(): Promise<PatientRecord[]> {
        const [results] = (await pool.execute('SELECT * FROM `patients` ORDER BY `lastName`')) as PatientResults;
        return results.map(result => new PatientRecord(result));
    }

    static async getOne(id: string): Promise<PatientRecord | null> {
        const [results] = (await pool.execute('SELECT * FROM `patients` WHERE `id`=:id', {
            id,
        })) as PatientResults;

        return results.length !== 0 ? new PatientRecord(results[0]) : null;
    }
}

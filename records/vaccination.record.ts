import {v4 as uuid} from "uuid";
import {pool} from "../utils/db";
import {FieldPacket} from "mysql2";
import {ValidationError} from "../utils/error";

type VaccinationResults = [VaccinationRecord[], FieldPacket[]];

export class VaccinationRecord {
    id: string;
    name: string;
    count: number;

    constructor(obj: Omit<VaccinationRecord, 'insert'>) {
        if (!obj.name || obj.name.length < 3 || obj.name.length > 50) {
            throw new ValidationError('Nazwa szczepionki musi mieć od 3 do 50 znaków.')
        }
        if (!obj.count || obj.count < 1 || obj.count > 999999) {
            throw new ValidationError('Liczba sztuk szczepionek powinna mieścić się w przedziale 1-999999')
        }

        this.id = obj.id;
        this.name = obj.name;
        this.count = obj.count;
    }

    async insert(): Promise<string> {
        if (!this.id) {
            this.id = uuid();
        }

        await pool.execute('INSERT INTO `vaccinations` VALUES(:id, :name, :count)', {
            id: this.id,
            name: this.name,
            count: this.count,
        })

        return this.id;
    }

    static async listAll(): Promise<VaccinationRecord[]> {
        const [results] = (await pool.execute('SELECT * FROM `vaccinations`')) as VaccinationResults;
        return results.map(result => new VaccinationRecord(result));
    }

    static async getOne(id: string): Promise<VaccinationRecord | null> {
        const [results] = (await pool.execute('SELECT * FROM `vaccinations` WHERE `id`=:id', {
            id,
        })) as VaccinationResults;

        return results.length !== 0 ? new VaccinationRecord(results[0]) : null;
    }

    async update(): Promise<void> {

        await pool.execute('UPDATE `vaccinations` SET `name`=:name, `count`=:count WHERE `id`=:id', {
            id: this.id,
            name: this.name,
            count: this.count,
        })

    }

    async countUsedVaccinations(): Promise<number> {
        const [[{count}]] = (await pool.execute('SELECT COUNT(*) AS `count` FROM `patients` WHERE `vaccinationId`=:id', {
            id: this.id,
        })) as VaccinationResults;

        return count;
    }
}

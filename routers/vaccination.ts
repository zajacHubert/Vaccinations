import {Router} from "express";
import {VaccinationRecord} from "../records/vaccination.record";

export const vaccinationRouter = Router();

vaccinationRouter
    .get('/', async (req, res) => {
        const vaccinationList = await VaccinationRecord.listAll();
        res.render('vaccination/list', {
            vaccinationList,
        })
    })
    .post('/', async (req, res) => {
        const data = {
            ...req.body,
            count: Number(req.body.count),
        }

        const newVaccination = new VaccinationRecord(data);
        await newVaccination.insert();

        res.redirect('/vaccination');
    })

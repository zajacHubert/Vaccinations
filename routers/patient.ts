import {Router} from "express";
import {PatientRecord} from "../records/patient.record";
import {VaccinationRecord} from "../records/vaccination.record";
import {ValidationError} from "../utils/error";

export const patientRouter = Router();

patientRouter
    .get('/', async (req, res) => {
        const patientList = await PatientRecord.listAll();
        const vaccinationList = await VaccinationRecord.listAll();
        res.render('patient/list', {
            patientList,
            vaccinationList,
        })
    })
    .post('/', async (req, res) => {
        const newPatient = new PatientRecord(req.body);
        await newPatient.insert();

        res.redirect('/patient');
    })
    .patch('/vaccination/:patientId', async (req, res) => {
        const patient = await PatientRecord.getOne(req.params.patientId);

        if (patient === null) {
            throw new ValidationError("Nie znaleziono pacjenta o podanym ID")
        }

        const vaccination = req.body.vaccinationId === '' ? null : await VaccinationRecord.getOne(req.body.vaccinationId);

        if (vaccination) {
            if (vaccination.count <= await vaccination.countUsedVaccinations()) {
                throw new ValidationError('Brak tej szczepionki na magazynie');
            }
        }

        patient.vaccinationId = vaccination?.id ?? null;
        await patient.update();
        res.redirect('/patient');

    })

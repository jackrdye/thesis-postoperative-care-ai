import { Doctor, Patient, Operation } from '@prisma/client';

export type OperationWithDoctorAndPatient = Operation & {
  doctor: Doctor;
  patient: Patient;
};

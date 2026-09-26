import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, Employee, AttendanceStatus } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { Drawer } from '../components/ui/Drawer';
import {
  Users,
  BadgeCheck,
  CalendarCheck,
  Phone,
  Briefcase,
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  Coffee
} from 'lucide-react';

export const EmployesPage: React.FC = () => {
  const { employees, updateAttendance, companySettings, showToast } = useApp();
  const [selectedEmpForPayslip, setSelectedEmpForPayslip] = useState<Employee | null>(null);

  const getAttendanceBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return {
          label: 'Présent',
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
          icon: CheckCircle2
        };
      case 'RETARD':
        return {
          label: 'En Retard',
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
          icon: Clock
        };
      case 'ABSENT':
        return {
          label: 'Absent',
          color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
          icon: XCircle
        };
      case 'CONGE':
        return {
          label: 'En Congé',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
          icon: Coffee
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Gestion RH & Paie OHADA (Cameroun)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des présences, cotisations CNPS (4.2%), barème IRPP et CAC 10%.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white">{employees.length}</span> collaborateurs enregistrés
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {employees.map((emp) => {
          const fullName = `${emp.firstName} ${emp.lastName}`;
          const attBadge = getAttendanceBadge(emp.attendance);
          const AttIcon = attBadge.icon;

          return (
            <div
              key={emp.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <Avatar name={fullName} size="lg" />
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${attBadge.color}`}
                    >
                      <AttIcon className="w-3 h-3" />
                      <span>{attBadge.label}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {fullName}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                    {emp.role}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {emp.matricule} · CNPS: {emp.cnpsNumber}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Département :</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {emp.department}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Salaire Net :</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatFCFA(emp.netAPayer)}
                    </span>
                  </div>
                </div>

                {/* Quick Attendance Selector */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Pointer la présence :
                  </span>
                  <div className="grid grid-cols-4 gap-1 mt-1 text-[10px] font-medium">
                    {(['PRESENT', 'RETARD', 'ABSENT', 'CONGE'] as AttendanceStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateAttendance(emp.id, st)}
                        className={`py-1 rounded-sm text-center transition-colors cursor-pointer ${
                          emp.attendance === st
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'PRESENT' ? 'Prés.' : st === 'RETARD' ? 'Ret.' : st === 'ABSENT' ? 'Abs.' : 'Cong.'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedEmpForPayslip(emp)}
                  className="w-full py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Bulletin de Paie OHADA</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DRAWER: BULLETIN DE PAIE OHADA / CNPS / IRPP */}
      {selectedEmpForPayslip && (
        <Drawer
          isOpen={true}
          onClose={() => setSelectedEmpForPayslip(null)}
          title={`Bulletin de Paie : ${selectedEmpForPayslip.firstName} ${selectedEmpForPayslip.lastName}`}
          subtitle={`Période : Septembre 2026 · Immatriculation CNPS ${selectedEmpForPayslip.cnpsNumber}`}
          width="xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => {
                  showToast('Téléchargement du bulletin de paie généré au format PDF');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger PDF</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer Bulletin</span>
              </button>
            </div>
          }
        >
          <div className="space-y-5 text-xs text-slate-900 dark:text-slate-100">
            {/* Header Employer & Employee */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-blue-600">{companySettings.name}</p>
                <p className="text-[11px] text-slate-500">{companySettings.address}, {companySettings.city}</p>
                <p className="text-[11px] font-mono text-slate-500">NIU : {companySettings.niu}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{selectedEmpForPayslip.firstName} {selectedEmpForPayslip.lastName}</p>
                <p className="text-slate-500">{selectedEmpForPayslip.role}</p>
                <p className="font-mono text-slate-500">Matricule : {selectedEmpForPayslip.matricule}</p>
              </div>
            </div>

            {/* Elements de Remuneration Brute */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 mb-2">
                1. Rémunération Brute
              </h4>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-2.5 flex justify-between">
                  <span>Salaire de Base Conventionnel</span>
                  <span className="font-mono font-semibold">
                    {formatFCFA(selectedEmpForPayslip.baseSalary)}
                  </span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span>Indemnité Légale de Transport</span>
                  <span className="font-mono">
                    {formatFCFA(selectedEmpForPayslip.primeTransport)}
                  </span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span>Prime de Rendement & Présence</span>
                  <span className="font-mono">
                    {formatFCFA(selectedEmpForPayslip.primeRendement)}
                  </span>
                </div>
                <div className="p-2.5 flex justify-between font-bold bg-slate-50 dark:bg-slate-800/40">
                  <span>Salaire Brut Total Imposable :</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {formatFCFA(
                      selectedEmpForPayslip.baseSalary +
                        selectedEmpForPayslip.primeTransport +
                        selectedEmpForPayslip.primeRendement
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Retenues Sociales & Fiscales OHADA */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 mb-2">
                2. Retenues Sociales & Fiscales Obligatoires (Cameroun)
              </h4>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-2.5 flex justify-between">
                  <div>
                    <span className="font-medium">Cotisation CNPS Employé (4.2%)</span>
                    <span className="block text-[10px] text-slate-400">Plafond mensuel 750 000 FCFA</span>
                  </div>
                  <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                    -{formatFCFA(selectedEmpForPayslip.deductionCNPS)}
                  </span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <div>
                    <span className="font-medium">IRPP (Impôt sur le Revenu)</span>
                    <span className="block text-[10px] text-slate-400">Barème progressif DGI Cameroun</span>
                  </div>
                  <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                    -{formatFCFA(selectedEmpForPayslip.deductionIRPP)}
                  </span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <div>
                    <span className="font-medium">CAC - Centimes Additionnels Communaux</span>
                    <span className="block text-[10px] text-slate-400">10% du montant de l IRPP</span>
                  </div>
                  <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                    -{formatFCFA(selectedEmpForPayslip.deductionCAC)}
                  </span>
                </div>
              </div>
            </div>

            {/* Net a Payer Highlight */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-600 dark:border-blue-500 flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-600 dark:text-slate-300">
                  Net à Payer au Collaborateur :
                </span>
                <span className="block text-[10px] text-slate-400">
                  Virement par compte ou Orange Money / MoMo
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-blue-700 dark:text-blue-300">
                {formatFCFA(selectedEmpForPayslip.netAPayer)}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-2">
              Bulletin conforme au Code du Travail de la République du Cameroun et aux règles OHADA.
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};

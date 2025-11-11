import { Component, OnInit, OnDestroy } from '@angular/core'; // Importa OnDestroy
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms'; // Importa FormArray
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // RouterLink ya estaba
import { PacienteService, Paciente } from '../paciente.service';
import { AuthService } from '../../auth/auth'; // Importa AuthService desde auth.ts
import { Observable, Subscription, of } from 'rxjs'; // Importa Subscription y 'of'
import { HttpErrorResponse } from '@angular/common/http';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, MaterialModule, CdkTextareaAutosize ],
  templateUrl: './paciente-form.component.html',
  styleUrls: ['./paciente-form.component.css']
})
export class PacienteFormComponent implements OnInit, OnDestroy {

  pacienteForm!: FormGroup; // FormGroup principal para TODOS los datos
  pacienteId: string | null = null;
  seccionActiva: string | null = null; // Para saber qué sección mostrar ('datos-personales', 'alergias', etc.)
  isLoading = false;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  // Suscripciones para limpiar
  private childRouteSubscription: Subscription | undefined;
  private parentRouteSubscription: Subscription | undefined;
  private dataLoaded = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute, // Ruta actual (hija o /nuevo)
    private router: Router,
    private pacienteService: PacienteService,
    private authService: AuthService // Inyecta AuthService
  ) {}

  ngOnInit(): void {
    // Inicializa TODO el formulario primero
    this.inicializarFormularioCompleto();

    // Determina si estamos en modo Creación o Edición y qué sección mostrar
    this.parentRouteSubscription = this.route.parent?.paramMap.subscribe(parentParams => {
      const id = parentParams.get('id');

      if (id) {
          // --- MODO EDICIÓN (cargado como hijo de /detalle) ---
          this.pacienteId = id;
          console.log('Modo Edición - ID Paciente:', this.pacienteId);

          // Cargar datos completos si no se han cargado
          if (!this.dataLoaded) {
              this.cargarDatosPaciente(this.pacienteId);
          }

          // Suscribirse a la URL de ESTA ruta hija para obtener la sección
          if (!this.childRouteSubscription) {
              this.childRouteSubscription = this.route.url.subscribe(segments => {
                  const seccion = segments.length > 0 ? segments[0].path : null;
                  console.log("Segmento URL hija:", seccion); // Log para depurar
                  if (seccion && this.isValidSection(seccion)) {
                      this.seccionActiva = seccion; // Asigna la sección activa de la URL
                      console.log('Sección activa (Edición):', this.seccionActiva);
                  } else {
                      // Si la ruta hija no es válida, redirige a la por defecto
                      console.warn(`Sección "${seccion}" inválida o ausente. Redirigiendo a datos-personales.`);
                      this.router.navigate(['./datos-personales'], { relativeTo: this.route.parent, replaceUrl: true });
                  }
                  this.mensajeError = null; this.mensajeExito = null; // Limpia mensajes
              });
          }
      } else {
          // --- MODO CREACIÓN (/pacientes/nuevo) ---
          console.log('Modo Creación Inicial (/pacientes/nuevo).');
          this.pacienteId = null;
          this.dataLoaded = true; // No hay datos preexistentes
          this.seccionActiva = 'datos-personales'; // <<< FIJAMOS la sección a mostrar
          console.log('Sección activa (Creación):', this.seccionActiva);
          this.pacienteForm.reset(); // Limpia
          this.childRouteSubscription?.unsubscribe(); this.childRouteSubscription = undefined;
      }
    }); // Fin parentRouteSubscription
  }

  ngOnDestroy(): void {
    this.childRouteSubscription?.unsubscribe();
    this.parentRouteSubscription?.unsubscribe();
  }

  // Verifica si un nombre de sección (de la URL) corresponde a un FormGroup
  isValidSection(section: string): boolean {
      return !!this.getFormGroupName(section); // Usa el mapeo
  }

  // Mapea el nombre de la sección URL al nombre del FormGroup
  getFormGroupName(section: string | null): string | null {
       const sectionMap: { [key: string]: string } = {
          'datos-personales': 'datosPersonales',
          'alergias': 'alergiasTransfusiones',
          'antecedentes': 'antecedentesPersonales',
          'medicacion': 'medicacionActual',
          'historia': 'historiaClinica',
          'dialisis': 'parametrosDialisis',
          'evolucion': 'evolucionMensual'
       };
       return section ? sectionMap[section] || null : null;
   }

  // --- INICIALIZAR FORMULARIO COMPLETO ---
  // ¡¡¡COMPLETA ESTO CON TODOS LOS CAMPOS DE CADA SECCIÓN!!!
  inicializarFormularioCompleto(): void {
    this.pacienteForm = this.fb.group({
      datosPersonales: this.fb.group({ // Mapea a 'datos-personales'
        nombre: ['', Validators.required], apellido: ['', Validators.required], fechaNacimiento: [null, Validators.required],
        documento: ['', Validators.required], genero: ['', Validators.required], estadoCivil: [''],
        fechaPrimeraDialisis: [null], telefonos: [''], emails: this.fb.array([]), // Array para emails
        domicilio: [''], obraSocial: [''], institucion: ['']
      }),
      alergiasTransfusiones: this.fb.group({ // Mapea a 'alergias'
        alergias: this.fb.array([]), // Array de FormGroups { descripcion: string }
        testigoJehova: ['false'],
        seTransfunde: ['true'] // Valores por defecto como strings para mat-select
      }),
      antecedentesPersonales: this.fb.group({ // Mapea a 'antecedentes'
          items: this.fb.array([]) // Array de FormGroups { nombre: string, detalle: string }
      }),
      medicacionActual: this.fb.group({ // Mapea a 'medicacion'
          items: this.fb.array([]) // Array de FormGroups { nombre: string, dosis: string }
      }),
      historiaClinica: this.fb.group({ // Mapea a 'historia'
          items: this.fb.array([]) // Array de FormGroups { fecha: string, detalle: string }
      }),
      parametrosDialisis: this.fb.group({ // Mapea a 'dialisis'
          qt: [''], qd: [''], qb: [''], accesoVascular: [''], agujas: [''], heparina: [''], filtro: [''], pesoSeco: [''], sodio: [''], bicarbonato: [''], uf: [''], eritropoyetina: [''], hierro: ['']
      }),
      evolucionMensual: this.fb.group({ // Mapea a 'evolucion'
          items: this.fb.array([]) // Array de FormGroups { mes: string, detalle: string }
      })
    });
  }

  // --- Métodos para FormArrays (Completar para todos los arrays) ---
  // Alergias (array de FormGroups {descripcion: ''})
  get alergiasArray(): FormArray { return this.pacienteForm.get('alergiasTransfusiones.alergias') as FormArray; }
  nuevaAlergia(): FormGroup { return this.fb.group({ descripcion: ['', Validators.required] }); }
  agregarAlergia(): void { this.alergiasArray.push(this.nuevaAlergia()); }
  eliminarAlergia(index: number): void { this.alergiasArray.removeAt(index); }

  // Emails
  get emailsArray(): FormArray { return this.pacienteForm.get('datosPersonales.emails') as FormArray; }
  nuevoEmail(): FormGroup { return this.fb.group({ email: ['', [Validators.required, Validators.email]] }); }
  agregarEmail(): void { this.emailsArray.push(this.nuevoEmail()); }
  eliminarEmail(index: number): void { this.emailsArray.removeAt(index); }

  // Antecedentes
  get antecedentesItems(): FormArray { return this.pacienteForm.get('antecedentesPersonales.items') as FormArray; }
  nuevoAntecedente(): FormGroup { return this.fb.group({ nombre: ['', Validators.required], detalle: [''] }); }
  agregarAntecedente(): void { this.antecedentesItems.push(this.nuevoAntecedente()); }
  eliminarAntecedente(index: number): void { this.antecedentesItems.removeAt(index); }

  // Medicacion
  get medicacionItems(): FormArray { return this.pacienteForm.get('medicacionActual.items') as FormArray; }
  nuevaMedicacion(): FormGroup { return this.fb.group({ nombre: ['', Validators.required], dosis: [''] }); }
  agregarMedicacion(): void { this.medicacionItems.push(this.nuevaMedicacion()); }
  eliminarMedicacion(index: number): void { this.medicacionItems.removeAt(index); }

  // Historia Clinica
  get historiaItems(): FormArray { return this.pacienteForm.get('historiaClinica.items') as FormArray; }
  nuevaHistoria(): FormGroup {
    const fechaActual = new Date().toISOString().split('T')[0];
    const profesional = this.authService.obtenerNombreUsuario() || ''; // Obtener el nombre del usuario logueado
    return this.fb.group({
      fecha: [fechaActual, Validators.required],
      profesional: [profesional, Validators.required],
      grupoSanguineo: ['', Validators.required],
      peso: [''],
      pesoSeco: [''],
      altura: [''],
      fechaPrimeraDialisisVida: [''],
      fechaPrimeraDialisisClinica: [''],
      heparina: [''],
      antecedentesEnfermedad: [''],
      medicacionPrescritaDialisis: [''],
      medicacionDomiciliaria: [''],
      detalle: ['', Validators.required]
    });
  }
  agregarHistoria(): void { this.historiaItems.push(this.nuevaHistoria()); }
  eliminarHistoria(index: number): void { this.historiaItems.removeAt(index); }

   // Evolucion Mensual
  get evolucionItems(): FormArray { return this.pacienteForm.get('evolucionMensual.items') as FormArray; }
  nuevaEvolucion(): FormGroup {
    const profesional = this.authService.obtenerNombreUsuario() || '';
    return this.fb.group({
      fecha: [new Date(), Validators.required],
      profesional: [profesional, Validators.required],
      informeGeneral: ['', Validators.required]
    });
  }
  agregarEvolucion(): void { this.evolucionItems.push(this.nuevaEvolucion()); }
  eliminarEvolucion(index: number): void { this.evolucionItems.removeAt(index); }
  // --- Fin Métodos FormArray ---


  cargarDatosPaciente(id: string): void {
      if (this.dataLoaded) { console.log("Datos ya cargados."); return; }
      this.isLoading = true; this.mensajeError = null;
      console.log(`Llamando a getPacientePorId(${id})...`);
      this.pacienteService.getPacientePorId(id).subscribe({
        next: (paciente: Paciente) => {
          console.log('Datos COMPLETOS recibidos:', paciente);
          // Limpia FormArrays ANTES de patchValue
          this.alergiasArray.clear();
          this.emailsArray.clear();
          this.antecedentesItems.clear();
          this.medicacionItems.clear();
          this.historiaItems.clear();
          this.evolucionItems.clear();

          // Prepara y aplica datos para cada sección
          // Datos Personales
          const datosPersonales = {
            nombre: paciente.nombre,
            apellido: paciente.apellido,
            fechaNacimiento: paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento) : null,
            documento: paciente.documento,
            genero: paciente.genero,
            estadoCivil: paciente.estadoCivil,
            fechaPrimeraDialisis: paciente.fechaPrimeraDialisis ? new Date(paciente.fechaPrimeraDialisis) : null,
            telefonos: paciente.telefonos?.join(', ') || '',
            domicilio: paciente.domicilio,
            obraSocial: paciente.obraSocial,
            institucion: paciente.institucion
          };
          this.datosPersonalesForm.patchValue(datosPersonales);

          // Emails
          paciente.emails?.forEach(email => {
            this.emailsArray.push(this.fb.group({ email: email }));
          });

          // Alergias y Transfusiones
          const alergiasTransfusiones = {
            testigoJehova: paciente.testigoJehova?.toString() || 'false',
            seTransfunde: paciente.seTransfunde?.toString() || 'true'
          };
          this.alergiasTransfusionesForm.patchValue(alergiasTransfusiones);
          paciente.alergias?.forEach(item => this.alergiasArray.push(this.fb.group(item)));

          // Antecedentes Personales
          paciente.antecedentesPersonales?.forEach(item => this.antecedentesItems.push(this.fb.group(item)));

          // Medicación Actual
          paciente.medicacionActual?.forEach(item => this.medicacionItems.push(this.fb.group(item)));

          // Historia Clínica
          paciente.historiaClinica?.forEach(item => this.historiaItems.push(this.fb.group(item)));

          // Parámetros de Diálisis
          if (paciente.parametrosDialisis) {
            this.parametrosDialisisForm.patchValue(paciente.parametrosDialisis);
          }

          // Evolución Mensual
          paciente.evolucionMensual?.forEach(item => this.evolucionItems.push(this.fb.group(item)));

          console.log("Formulario después de patchValue:", this.pacienteForm.value);
          this.isLoading = false; this.dataLoaded = true;
        },
        error: (err: HttpErrorResponse | any) => {
          console.error('Error al cargar paciente:', err);
          this.mensajeError = 'Error al cargar los datos del paciente.';
          this.isLoading = false;
        }
      });
  }


  onSubmit(): void {
    let formToValidate: FormGroup | null = null; // Siempre FormGroup
    let isCreating = !this.pacienteId;
    let formGroupName: string | null = null; // Nombre del FormGroup a guardar

    if (isCreating) {
        // En modo creación, solo validamos y guardamos 'datosPersonales'
        formGroupName = 'datosPersonales';
        formToValidate = this.pacienteForm.get(formGroupName) as FormGroup;
        this.seccionActiva = 'datos-personales'; // Asegura que seccionActiva sea correcto
    } else if (this.seccionActiva) {
        // En modo edición, validamos la sección activa
        formGroupName = this.getFormGroupName(this.seccionActiva);
        formToValidate = formGroupName ? this.pacienteForm.get(formGroupName) as FormGroup : null;
    }

    if (!formToValidate) { /* ... manejo error ... */ return; }

    // Marca como tocado antes de validar
    this.markAllAsTouched(formToValidate);
    if (formToValidate.invalid || this.isLoading) { /* ... manejo error ... */ return; }

    this.mensajeError = null; this.mensajeExito = null; this.isLoading = true;
    const datosSeccion = formToValidate.value;
    let guardarObservable: Observable<Paciente>;

    if (isCreating) {
      // --- CREACIÓN ---
      const datosParaCrear: Partial<Paciente> = {
        ...datosSeccion, // nombre, apellido, etc.
        // Convierte arrays si es necesario (ej: si teléfonos/emails fueran FormArray)
        telefonos: datosSeccion.telefonos?.split(',').map((s: string) => s.trim()).filter((s: string) => s) || [],
        emails: datosSeccion.emails?.map((item: any) => item.email).filter((email: string) => email) || []
      };
      console.log('Enviando para CREAR paciente:', datosParaCrear);
      guardarObservable = this.pacienteService.crearPaciente(datosParaCrear);
    } else {
      // --- ACTUALIZACIÓN ---
      console.log(`Enviando para ACTUALIZAR sección ${formGroupName} del paciente ${this.pacienteId}:`, datosSeccion);
      // Mapea los datos del formulario al formato esperado por el backend
      const datosActualizar: Partial<Paciente> = this.mapFormDataToBackend(formGroupName!, datosSeccion);
      console.log('Datos mapeados para actualizar:', datosActualizar);
      guardarObservable = this.pacienteService.actualizarPaciente(this.pacienteId!, datosActualizar);
    }

    guardarObservable.subscribe({
      next: (pacienteGuardado: Paciente) => {
         this.isLoading = false; const id = pacienteGuardado.id;
         if (!id) { /* ... */ return; }

         if (isCreating) {
             this.pacienteId = id; this.mensajeExito = "Paciente creado. Redirigiendo...";
             // Actualiza TODO el formulario con los datos devueltos (incluyendo el ID y QR si lo genera el backend)
             this.pacienteForm.patchValue(pacienteGuardado);
             // Rellenar FormArrays con datos devueltos (si los hay)
             this.alergiasArray.clear(); pacienteGuardado.alergias?.forEach(item => this.alergiasArray.push(this.fb.group(item)));
             this.emailsArray.clear(); pacienteGuardado.emails?.forEach(email => this.emailsArray.push(this.fb.group({ email: email })));
             this.antecedentesItems.clear(); pacienteGuardado.antecedentesPersonales?.forEach(item => this.antecedentesItems.push(this.fb.group(item)));
             // ... Rellenar otros ...
             setTimeout(() => { this.router.navigate(['/pacientes', id, 'detalle', 'datos-personales'], { replaceUrl: true }); }, 1000); // Redirige al detalle, sección datos-personales

         } else {
             this.mensajeExito = `Sección guardada.`;
             // Actualiza TODO el formulario con los datos devueltos
             this.pacienteForm.patchValue(pacienteGuardado);
              // Rellenar FormArrays con datos devueltos...
             formToValidate!.markAsPristine();
             setTimeout(() => this.mensajeExito = null, 3000);
         }
       },
      error: (err: HttpErrorResponse | any) => { /* ... */ }
    });
  }


  markAllAsTouched(formGroup: FormGroup | FormArray): void {
     Object.values(formGroup.controls).forEach(control => {
       control.markAsTouched();
       if (control instanceof FormGroup || control instanceof FormArray) {
         this.markAllAsTouched(control);
       } else if (control) { // Añade chequeo por si control es null/undefined
         control.updateValueAndValidity({ onlySelf: true });
       }
     });
  }

  // Método para mapear datos del formulario al formato esperado por el backend
  private mapFormDataToBackend(formGroupName: string, datosSeccion: any): Partial<Paciente> {
    switch (formGroupName) {
      case 'datosPersonales':
        return {
          ...datosSeccion,
          telefonos: datosSeccion.telefonos?.split(',').map((s: string) => s.trim()).filter((s: string) => s) || [],
          emails: datosSeccion.emails?.map((item: any) => item.email).filter((email: string) => email) || []
        };
      case 'alergiasTransfusiones':
        return {
          alergias: datosSeccion.alergias,
          testigoJehova: datosSeccion.testigoJehova === 'true',
          seTransfunde: datosSeccion.seTransfunde === 'true'
        };
      case 'antecedentesPersonales':
        return {
          antecedentesPersonales: datosSeccion.items
        };
      case 'medicacionActual':
        return {
          medicacionActual: datosSeccion.items
        };
      case 'historiaClinica':
        return {
        historiaClinica: datosSeccion.items
        };
      case 'parametrosDialisis':
        // Convertir el FormGroup a Map<String, String>
        const parametros: { [key: string]: string } = {};
        Object.keys(datosSeccion).forEach(key => {
          if (datosSeccion[key]) {
            parametros[key] = datosSeccion[key];
          }
        });
        return {
          parametrosDialisis: parametros
        };
      case 'evolucionMensual':
        return {
          evolucionMensual: datosSeccion.items
        };
      default:
        return {};
    }
  }

  // Getters para todos los FormGroups/FormArrays
  get datosPersonalesForm(): FormGroup { return this.pacienteForm.get('datosPersonales') as FormGroup; }
  get alergiasTransfusionesForm(): FormGroup { return this.pacienteForm.get('alergiasTransfusiones') as FormGroup; }
  get antecedentesPersonalesForm(): FormGroup { return this.pacienteForm.get('antecedentesPersonales') as FormGroup; }
  get medicacionActualForm(): FormGroup { return this.pacienteForm.get('medicacionActual') as FormGroup; }
  get historiaClinicaForm(): FormGroup { return this.pacienteForm.get('historiaClinica') as FormGroup; }
  get parametrosDialisisForm(): FormGroup { return this.pacienteForm.get('parametrosDialisis') as FormGroup; }
  get evolucionMensualForm(): FormGroup { return this.pacienteForm.get('evolucionMensual') as FormGroup; }

  // Métodos de navegación
  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}

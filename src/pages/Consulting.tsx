import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Database, 
  Shield, 
  FileCheck, 
  TrendingUp, 
  Users, 
  Award,
  Download,
  CheckCircle2,
  Mail,
  FileText
} from "lucide-react";

const Consulting = () => {
  const { language } = useLanguage();
  const [leadFormData, setLeadFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    companySize: "",
    industry: "",
    mainChallenge: "",
  });
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent, resourceDownloaded: string) => {
    e.preventDefault();
    setIsSubmittingLead(true);

    try {
      const { error } = await supabase.functions.invoke("submit-consulting-lead", {
        body: { ...leadFormData, resourceDownloaded },
      });

      if (error) throw error;

      toast.success(language === "es" ? "¡Acceso enviado a tu email!" : "Access sent to your email!");
      setLeadSubmitted(true);
      setLeadFormData({
        name: "",
        email: "",
        company: "",
        role: "",
        companySize: "",
        industry: "",
        mainChallenge: "",
      });
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error(language === "es" ? "Error al enviar. Intenta de nuevo." : "Error submitting. Please try again.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    try {
      const { error } = await supabase.functions.invoke("submit-contact-inquiry", {
        body: contactFormData,
      });

      if (error) throw error;

      toast.success(language === "es" ? "Consulta enviada exitosamente" : "Inquiry sent successfully");
      setContactFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact:", error);
      toast.error(language === "es" ? "Error al enviar. Intenta de nuevo." : "Error submitting. Please try again.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // EDITA AQUÍ LAS DESCRIPCIONES DETALLADAS (200-300 palabras cada una)
  const services = [
    {
      icon: Shield,
      title: {
        es: "Regulatory Compliance Consulting",
        en: "Regulatory Compliance Consulting"
      },
      description: {
        es: "Implementación de FDA 21 CFR 820.50, ISO 13485, EU MDR; compliance para productos combinados; estrategia y documentación regulatoria; preparación y remediación de auditorías.",
        en: "FDA 21 CFR 820.50, ISO 13485, EU MDR implementation; combination product compliance; regulatory strategy and documentation; audit preparation and remediation."
      },
      detailedDescription: {
        es: "Navegue con confianza los complejos requisitos de FDA 21 CFR 820.50, ISO 13485:2016, y EU MDR 2017/745 con nuestra consultoría especializada en cumplimiento regulatorio. Nuestro enfoque integrado asegura que su organización no solo cumpla con los estándares actuales, sino que anticipe cambios regulatorios futuros. Ofrecemos evaluaciones exhaustivas de brechas (gap analysis) que identifican vulnerabilidades en sus sistemas de calidad antes de que se conviertan en hallazgos de inspección. Nuestro equipo desarrolla estrategias de implementación personalizadas que alinean las regulaciones con sus procesos operativos reales, eliminando la duplicación de esfuerzos entre múltiples marcos regulatorios. Especializados en productos de combinación (drug-device, biologic-device), proporcionamos guía experta para navegar los requisitos duales de GMP y QSR. Preparamos a su equipo para inspecciones regulatorias mediante auditorías simuladas, desarrollo de documentación robusta, y entrenamiento específico para interacciones con inspectores. Nuestros servicios incluyen: remediación de warning letters, preparación para auditorías de Notified Body, desarrollo de políticas y procedimientos conforme a regulaciones, y estrategia regulatoria para entrada a nuevos mercados.",
        en: "Navigate with confidence the complex requirements of FDA 21 CFR 820.50, ISO 13485:2016, and EU MDR 2017/745 with our specialized regulatory compliance consulting. Our integrated approach ensures your organization not only meets current standards but anticipates future regulatory changes. We offer comprehensive gap analyses that identify vulnerabilities in your quality systems before they become inspection findings. Our team develops customized implementation strategies that align regulations with your actual operational processes, eliminating duplication of efforts across multiple regulatory frameworks. Specialized in combination products (drug-device, biologic-device), we provide expert guidance to navigate the dual requirements of GMP and QSR. We prepare your team for regulatory inspections through mock audits, robust documentation development, and specific training for inspector interactions. Our services include: warning letter remediation, Notified Body audit preparation, development of regulation-compliant policies and procedures, and regulatory strategy for new market entry."
      },
      cases: [
        {
          id: "case-1-warning-letter",
          title: {
            es: "Remediación de Warning Letter de FDA",
            en: "FDA Warning Letter Remediation"
          },
          situation: {
            es: "Empresa mediana de dispositivos Clase III recibió warning letter de FDA citando deficiencias críticas en purchasing controls: falta de documentación en evaluaciones de proveedores, ausencia de acuerdos de calidad formales, especificaciones de compra inadecuadas, y uso de proveedores no calificados para componentes críticos. La empresa enfrentaba riesgo de consent decree si no remediaba sistémicamente.",
            en: "Mid-sized Class III device company received FDA warning letter citing critical purchasing control deficiencies: lack of documentation in supplier evaluations, absence of formal quality agreements, inadequate purchasing specifications, and use of unqualified suppliers for critical components. The company faced consent decree risk if not systematically remediated."
          },
          solution: {
            es: "Implementamos programa de remediación integral: (1) Rediseñamos jerarquía documental completa (política-procedimiento-work instructions-records), (2) Establecimos matrices de clasificación de riesgo para proveedores con criterios objetivos, (3) Desarrollamos templates estandarizados para quality agreements, supplier surveys, y audit reports, (4) Re-evaluamos todos los proveedores activos según nuevos criterios, (5) Entrenamos equipos de Quality, Procurement, y Engineering en nuevos procesos, (6) Preparamos paquete de respuesta a FDA con evidencia objetiva de correcciones sistémicas y effectiveness checks.",
            en: "We implemented comprehensive remediation program: (1) Redesigned complete documentation hierarchy (policy-procedure-work instructions-records), (2) Established supplier risk classification matrices with objective criteria, (3) Developed standardized templates for quality agreements, supplier surveys, and audit reports, (4) Re-evaluated all active suppliers per new criteria, (5) Trained Quality, Procurement, and Engineering teams on new processes, (6) Prepared FDA response package with objective evidence of systemic corrections and effectiveness checks."
          },
          results: {
            es: "FDA aceptó la respuesta en primera revisión sin requerir información adicional. Warning letter cerrado en 8 meses vs promedio industria de 18-24 meses (reducción 60%). La empresa pasó su siguiente inspección de rutina sin observaciones relacionadas con purchasing controls. Sistema implementado previno recurrencia: cero hallazgos similares en inspecciones subsecuentes durante 4+ años.",
            en: "FDA accepted response on first review without requiring additional information. Warning letter closed in 8 months vs industry average of 18-24 months (60% reduction). Company passed its next routine inspection with no observations related to purchasing controls. Implemented system prevented recurrence: zero similar findings in subsequent inspections over 4+ years."
          }
        },
        {
          id: "case-2-notified-body-prep",
          title: {
            es: "Preparación para Auditoría de Notified Body bajo MDR",
            en: "Notified Body Audit Preparation under MDR"
          },
          situation: {
            es: "Fabricante de dispositivos Clase IIb perseguía transición de MDD a MDR para mantener CE marking. Notified Body indicó que auditoría de recertificación incluiría evaluación exhaustiva de supplier management, área históricamente débil con múltiples observaciones en auditorías previas. Empresa carecía de documentación robusta de supplier risk assessment, quality agreements incompletos, y proceso informal de change notification de proveedores.",
            en: "Class IIb device manufacturer pursued MDD to MDR transition to maintain CE marking. Notified Body indicated recertification audit would include exhaustive supplier management evaluation, historically weak area with multiple observations in previous audits. Company lacked robust supplier risk assessment documentation, incomplete quality agreements, and informal supplier change notification process."
          },
          solution: {
            es: "Ejecutamos preparación intensiva de 5 meses: (1) Realizamos gap assessment detallado contra Annex IX Section 2.3 y Article 10(9) de MDR, (2) Implementamos matriz de riesgo de proveedores considerando clase de dispositivo y criticidad de componente, (3) Actualizamos quality agreements con cláusulas MDR-específicas incluyendo preparedness para auditorías no anunciadas, (4) Establecimos proceso formal de change notification con evaluación de impacto en conformidad, (5) Preparamos proveedores críticos para posibles auditorías de Notified Body, (6) Condujimos mock audit completo identificando y cerrando gaps finales.",
            en: "We executed intensive 5-month preparation: (1) Conducted detailed gap assessment against Annex IX Section 2.3 and MDR Article 10(9), (2) Implemented supplier risk matrix considering device class and component criticality, (3) Updated quality agreements with MDR-specific clauses including unannounced audit preparedness, (4) Established formal change notification process with conformity impact evaluation, (5) Prepared critical suppliers for possible Notified Body audits, (6) Conducted complete mock audit identifying and closing final gaps."
          },
          results: {
            es: "Auditoría de Notified Body resultó en cero hallazgos mayores en supplier management (vs 3 observaciones mayores en auditoría previa). CE marking otorgado en primera revisión. Notified Body condujo auditoría no anunciada a proveedor crítico de sterilización—proveedor estaba completamente preparado y auditoría concluyó sin findings. Sistema implementado posicionó a la empresa para cumplimiento MDR sostenible.",
            en: "Notified Body audit resulted in zero major findings in supplier management (vs 3 major observations in previous audit). CE marking granted on first review. Notified Body conducted unannounced audit at critical sterilization supplier—supplier was fully prepared and audit concluded without findings. Implemented system positioned company for sustainable MDR compliance."
          }
        },
        {
          id: "case-3-combination-product",
          title: {
            es: "Cumplimiento Dual GMP/QSR para Producto de Combinación",
            en: "Dual GMP/QSR Compliance for Combination Product"
          },
          situation: {
            es: "Startup desarrollando drug-device combination product (biologic-device) preparaba first-in-human clinical trial. FDA indicó que inspección pre-clinical incluiría evaluación de controles tanto de device manufacturing (21 CFR 820) como de biologic component (21 CFR 600). Empresa tenía expertise fuerte en biologics pero experiencia limitada en device QMS. Supplier management especialmente débil: faltaban evaluaciones formales de proveedores de componentes de device, y calificación de contract manufacturer de device assembly era insuficiente.",
            en: "Startup developing drug-device combination product (biologic-device) prepared for first-in-human clinical trial. FDA indicated pre-clinical inspection would include evaluation of both device manufacturing controls (21 CFR 820) and biologic component (21 CFR 600). Company had strong biologics expertise but limited device QMS experience. Supplier management especially weak: formal evaluations of device component suppliers were missing, and device assembly contract manufacturer qualification was insufficient."
          },
          solution: {
            es: "Diseñamos e implementamos programa de purchasing controls híbrido: (1) Desarrollamos templates específicos para combination products abordando ambos device y biologic requirements, (2) Establecimos dual-track supplier qualification: proveedores de device components evaluados contra 21 CFR 820.50, proveedores de raw materials biológicos contra 21 CFR 600 y USP requirements, (3) Calificamos contract manufacturer de device assembly con auditoría comprehensiva y quality agreement robusto, (4) Implementamos material traceability system linking device components a lotes de biologic, (5) Entrenamos equipo en thinking like FDA inspector para ambos CDER y CDRH perspectives.",
            en: "We designed and implemented hybrid purchasing controls program: (1) Developed combination product-specific templates addressing both device and biologic requirements, (2) Established dual-track supplier qualification: device component suppliers evaluated against 21 CFR 820.50, biologic raw material suppliers against 21 CFR 600 and USP requirements, (3) Qualified device assembly contract manufacturer with comprehensive audit and robust quality agreement, (4) Implemented material traceability system linking device components to biologic lots, (5) Trained team in thinking like FDA inspector for both CDER and CDRH perspectives."
          },
          results: {
            es: "Inspección pre-clinical de FDA (4 días, equipo dual CDER/CDRH) resultó en solo 2 observaciones menores no relacionadas con purchasing controls. Clinical trial authorization otorgada sin delay. FDA inspectors comentaron que supplier management approach era 'modelo ejemplar' para combination products. Empresa posteriormente obtuvo aprobación comercial usando mismo framework de purchasing controls sin findings adicionales en pre-approval inspection.",
            en: "FDA pre-clinical inspection (4 days, dual CDER/CDRH team) resulted in only 2 minor observations unrelated to purchasing controls. Clinical trial authorization granted without delay. FDA inspectors commented that supplier management approach was 'exemplary model' for combination products. Company subsequently obtained commercial approval using same purchasing controls framework without additional findings in pre-approval inspection."
          }
        }
      ],
      impactMetric: {
        es: "Reducción de 60% en tiempo de cierre de warning letters (8 vs 18-24 meses promedio) • 100% tasa de aceptación de respuestas regulatorias en primera revisión • Cero hallazgos repetidos en inspecciones subsecuentes",
        en: "60% reduction in warning letter closure time (8 vs 18-24 months average) • 100% first-time acceptance rate for regulatory responses • Zero repeat findings in subsequent inspections"
      },
      ctaText: {
        es: "Descargar Guía: Cómo Preparar su QMS para Inspecciones FDA/Notified Body",
        en: "Download Guide: How to Prepare Your QMS for FDA/Notified Body Inspections"
      }
    },
    {
      icon: FileCheck,
      title: {
        es: "Digital Quality Management Systems (eQMS)",
        en: "Digital Quality Management Systems (eQMS)"
      },
      description: {
        es: "Transformación digital de procesos de calidad, integración bidireccional ERP–eQMS, controles de cumplimiento automatizados, monitorización en tiempo real.",
        en: "Digital transformation of quality processes, bidirectional ERP-eQMS integration, automated compliance controls, real-time monitoring."
      },
      detailedDescription: {
        es: "La transformación digital de procesos de calidad no es opcional—es esencial para mantenerse competitivo y cumplir con expectativas regulatorias modernas. Nuestros servicios de implementación de eQMS transforman sistemas manuales fragmentados en plataformas integradas que automatizan cumplimiento, mejoran visibilidad, y reducen carga administrativa. Guiamos la selección e implementación de sistemas eQMS (Trackwise, MasterControl, Veeva, Arena) alineados con sus necesidades específicas y presupuesto. Nuestro enfoque incluye mapeo de procesos actuales, identificación de puntos de dolor, diseño de workflows automatizados, y migración de datos históricos con integridad completa. Especializamos en integración bidireccional entre eQMS y sistemas ERP (SAP, Oracle, xTuple), creando un ecosistema donde decisiones de calidad—como bloqueo de proveedores por nonconformances—se propagan automáticamente a sistemas de compras, previniendo uso de materiales o proveedores no aprobados. Desarrollamos dashboards ejecutivos con KPIs en tiempo real: tiempos de CAPA, performance de proveedores, métricas de auditoría, y tendencias de calidad. Nuestros servicios incluyen: análisis de requerimientos, selección de vendor, diseño de workflows, configuración de sistema, validación según GAMP5, entrenamiento de usuarios, y soporte post-implementación.",
        en: "Digital transformation of quality processes is not optional—it's essential to remain competitive and meet modern regulatory expectations. Our eQMS implementation services transform fragmented manual systems into integrated platforms that automate compliance, improve visibility, and reduce administrative burden. We guide the selection and implementation of eQMS systems (Trackwise, MasterControl, Veeva, Arena) aligned with your specific needs and budget. Our approach includes current process mapping, pain point identification, automated workflow design, and historical data migration with complete integrity. We specialize in bidirectional integration between eQMS and ERP systems (SAP, Oracle, xTuple), creating an ecosystem where quality decisions—such as supplier blocking due to nonconformances—automatically propagate to purchasing systems, preventing use of unapproved materials or suppliers. We develop executive dashboards with real-time KPIs: CAPA cycle times, supplier performance, audit metrics, and quality trends. Our services include: requirements analysis, vendor selection, workflow design, system configuration, GAMP5 validation, user training, and post-implementation support."
      },
      realCase: {
        es: "Un fabricante multinacional de dispositivos implantables gestionaba supplier quality con hojas Excel distribuidas entre 5 sitios en 3 continentes. No existía visibilidad centralizada de performance de proveedores, auditorías eran redundantes, y SCARs se perdían en cadenas de email. El tiempo promedio para cerrar un SCAR era 90 días. Implementamos una plataforma eQMS centralizada con módulos para supplier management, CAPA/SCAR, document control, y audit management. Diseñamos workflows automatizados donde: (1) hallazgos de auditoría generan SCARs automáticos, (2) vencimientos de SCAR disparan escalaciones a management, (3) performance de proveedores alimenta scorecards en tiempo real, y (4) cambios en estado de aprobación de proveedores sincronizan con SAP bloqueando compras. Post-implementación, el tiempo de cierre de SCAR se redujo a 35 días, visibilidad ejecutiva mejoró con dashboards en tiempo real, y la siguiente auditoría de Notified Body resultó en cero hallazgos en supplier management—anteriormente el área con más observaciones.",
        en: "A multinational implantable device manufacturer managed supplier quality with Excel spreadsheets distributed across 5 sites in 3 continents. There was no centralized visibility of supplier performance, audits were redundant, and SCARs were lost in email chains. Average SCAR closure time was 90 days. We implemented a centralized eQMS platform with modules for supplier management, CAPA/SCAR, document control, and audit management. We designed automated workflows where: (1) audit findings automatically generate SCARs, (2) SCAR expirations trigger management escalations, (3) supplier performance feeds real-time scorecards, and (4) supplier approval status changes synchronize with SAP to block purchases. Post-implementation, SCAR closure time reduced to 35 days, executive visibility improved with real-time dashboards, and the next Notified Body audit resulted in zero findings in supplier management—previously the area with most observations."
      },
      impactMetric: {
        es: "Reducción de 61% en tiempo de cierre de CAPA/SCAR (90 a 35 días) • Eliminación de 100% de hallazgos de auditoría en supplier management • ROI positivo en 14 meses por reducción de labor administrativa",
        en: "61% reduction in CAPA/SCAR closure time (90 to 35 days) • 100% elimination of audit findings in supplier management • Positive ROI in 14 months from administrative labor reduction"
      },
      ctaText: {
        es: "Agendar Consulta: Evaluación de Madurez Digital de su QMS",
        en: "Schedule Consultation: Digital Maturity Assessment of Your QMS"
      }
    },
    {
      icon: TrendingUp,
      title: {
        es: "Supply Chain Risk Management",
        en: "Supply Chain Risk Management"
      },
      description: {
        es: "Clasificación y seguimiento de proveedores según riesgo, planes de continuidad del negocio, mitigación de proveedores únicos, programas de auditoría y gestión de acciones correctivas.",
        en: "Risk-based supplier classification and tracking, business continuity plans, single source mitigation, audit programs and corrective action management."
      },
      detailedDescription: {
        es: "La resiliencia de su supply chain determina la continuidad de su negocio y el cumplimiento regulatorio. Nuestros servicios de gestión de riesgo de supply chain identifican vulnerabilidades ocultas, desarrollan estrategias de mitigación, y establecen sistemas de monitoreo continuo que anticipan disrupciones antes de que impacten producción. Realizamos evaluaciones exhaustivas de riesgo utilizando metodologías probadas: análisis de criticidad de componentes, mapeo de supply chain multi-tier, evaluación de dependencias sole-source, análisis de concentración geográfica, y assessment de capacidad financiera de proveedores. Especializamos en clasificación de proveedores basada en riesgo multi-dimensional: criticidad del componente, impacto en safety/performance del dispositivo, clasificación de riesgo del dispositivo (Class I-III), y madurez del sistema de calidad del proveedor. Esta clasificación determina intensidad de controles, frecuencia de auditorías, y requerimientos de inspección. Desarrollamos programas de monitoreo continuo con KPIs accionables: on-time delivery, defect rates, CAPA responsiveness, audit findings, y financial health indicators. Para proveedores críticos sole-source, diseñamos estrategias de mitigación: dual-sourcing cuando factible, buffer stock calculado científicamente, acuerdos de business continuity, y planes de transferencia tecnológica.",
        en: "Supply chain resilience determines business continuity and regulatory compliance. Our supply chain risk management services identify hidden vulnerabilities, develop mitigation strategies, and establish continuous monitoring systems that anticipate disruptions before they impact production. We conduct comprehensive risk assessments using proven methodologies: component criticality analysis, multi-tier supply chain mapping, sole-source dependency evaluation, geographic concentration analysis, and supplier financial capacity assessment. We specialize in multi-dimensional risk-based supplier classification: component criticality, impact on device safety/performance, device risk classification (Class I-III), and supplier quality system maturity. This classification determines control intensity, audit frequency, and inspection requirements. We develop continuous monitoring programs with actionable KPIs: on-time delivery, defect rates, CAPA responsiveness, audit findings, and financial health indicators. For critical sole-source suppliers, we design mitigation strategies: dual-sourcing when feasible, scientifically calculated buffer stock, business continuity agreements, and technology transfer plans."
      },
      realCase: {
        es: "Un fabricante de sistemas de infusión para oncología dependía de un único proveedor en Asia para un componente crítico de la bomba. El proveedor no tenía redundancia en manufactura, y cualquier disrupción amenazaba producción global. La empresa no tenía visibilidad de performance del proveedor más allá de entregas actuales. Implementamos un programa integral: (1) negociamos con el proveedor para calificar una segunda línea de producción en facility diferente como redundancia, (2) desarrollamos un scorecard de performance con 12 KPIs monitoreados mensualmente, (3) establecimos buffer stock de 90 días basado en análisis de lead time y variabilidad de demand, (4) calificamos un segundo proveedor como backup (no para uso regular, pero ready-to-activate), y (5) creamos un plan de activación de contingencia con trigger points claros. Cuando el proveedor primario experimentó un incendio en su facility principal, la segunda línea calificada mantuvo suministro sin interrupción. La empresa evitó una crisis que hubiera resultado en paros de producción y pérdida de revenue estimada en $8M.",
        en: "An oncology infusion system manufacturer depended on a single supplier in Asia for a critical pump component. The supplier had no manufacturing redundancy, and any disruption threatened global production. The company had no supplier performance visibility beyond current deliveries. We implemented a comprehensive program: (1) negotiated with supplier to qualify a second production line in different facility as redundancy, (2) developed a performance scorecard with 12 KPIs monitored monthly, (3) established 90-day buffer stock based on lead time analysis and demand variability, (4) qualified a second supplier as backup (not for regular use, but ready-to-activate), and (5) created a contingency activation plan with clear trigger points. When the primary supplier experienced a fire in its main facility, the qualified second line maintained supply without interruption. The company avoided a crisis that would have resulted in production stoppages and estimated revenue loss of $8M."
      },
      impactMetric: {
        es: "Prevención de $8M en pérdida de revenue por interrupción evitada • Reducción de 45% en variabilidad de lead time mediante dual-sourcing estratégico • 100% continuidad de suministro durante crisis de proveedor primario",
        en: "$8M revenue loss prevention from avoided disruption • 45% reduction in lead time variability through strategic dual-sourcing • 100% supply continuity during primary supplier crisis"
      },
      ctaText: {
        es: "Descargar Herramienta: Matriz de Evaluación de Riesgo de Proveedores",
        en: "Download Tool: Supplier Risk Assessment Matrix"
      }
    },
    {
      icon: Users,
      title: {
        es: "Cross-Functional Process Optimization",
        en: "Cross-Functional Process Optimization"
      },
      description: {
        es: "Alineamiento Calidad–Compras–Ingeniería, integración de change control entre departamentos, diseño de jerarquía documental, liderazgo de equipos multifuncionales.",
        en: "Quality-Purchasing-Engineering alignment, cross-departmental change control integration, document hierarchy design, multifunctional team leadership."
      },
      detailedDescription: {
        es: "Los silos funcionales son el enemigo silencioso de la eficiencia operativa y el cumplimiento regulatorio. Nuestros servicios de optimización de procesos cross-funcionales eliminan fricción entre Quality, Engineering, Procurement, Regulatory, y Operations—creando flujos de trabajo integrados donde información fluye sin barreras y decisiones se toman con input de todas las perspectivas relevantes. Utilizamos metodologías Lean Six Sigma y Value Stream Mapping para identificar desperdicios, redundancias, y puntos de desconexión en procesos críticos: supplier qualification, change control, CAPA management, purchasing approvals, y product development. Diseñamos jerarquías documentales coherentes (política-procedimiento-work instruction-records) que eliminan confusión sobre roles y responsabilidades. Implementamos governance structures efectivos: comités de data governance, change control boards, y supplier review boards con representación cross-funcional, autoridad de decisión clara, y cadencia de reuniones definida. Facilitamos cultural transformation hacia colaboración genuina mediante workshops, coaching de líderes, y creación de incentivos alineados. Equipos que anteriormente funcionaban en competencia aprenden a verse como partners con objetivos compartidos.",
        en: "Functional silos are the silent enemy of operational efficiency and regulatory compliance. Our cross-functional process optimization services eliminate friction between Quality, Engineering, Procurement, Regulatory, and Operations—creating integrated workflows where information flows without barriers and decisions are made with input from all relevant perspectives. We use Lean Six Sigma and Value Stream Mapping methodologies to identify waste, redundancies, and disconnection points in critical processes: supplier qualification, change control, CAPA management, purchasing approvals, and product development. We design coherent documentation hierarchies (policy-procedure-work instruction-records) that eliminate confusion about roles and responsibilities. We implement effective governance structures: data governance committees, change control boards, and supplier review boards with cross-functional representation, clear decision authority, and defined meeting cadence. We facilitate cultural transformation toward genuine collaboration through workshops, leader coaching, and aligned incentive creation. Teams that previously operated in competition learn to see themselves as partners with shared objectives."
      },
      realCase: {
        es: "Una empresa de dispositivos de diagnóstico in-vitro sufría de procesos de change control extremadamente lentos: cambios simples de proveedores tomaban 6-9 meses desde solicitud hasta implementación. El proceso involucraba 7 aprobaciones secuenciales sin criterios claros. Engineering modificaba especificaciones sin notificar a Quality; Procurement seleccionaba proveedores sin input de SQE; Regulatory descubría cambios que requerían notificaciones solo cuando ya estaban implementados. Rediseñamos el proceso de change control con tres tiers basados en impacto (simple/moderate/complex) con diferentes approval paths. Creamos una matriz RACI clara definiendo roles en cada etapa. Establecimos un Change Control Board semanal con representantes de todas las funciones, autorizado para aprobar changes en la reunión. Implementamos un workflow en eQMS donde todos los stakeholders ven solicitudes simultáneamente y pueden comentar en paralelo. El tiempo promedio de change processing se redujo de 7.5 meses a 6 semanas para changes moderados y 2 semanas para changes simples—una reducción de 75-90%. La empresa pasó de backlog de 200+ cambios pendientes a current state en 6 meses.",
        en: "An in-vitro diagnostic device company suffered from extremely slow change control processes: simple supplier changes took 6-9 months from request to implementation. The process involved 7 sequential approvals without clear criteria. Engineering modified specifications without notifying Quality; Procurement selected suppliers without SQE input; Regulatory discovered changes requiring notifications only when already implemented. We redesigned the change control process with three impact-based tiers (simple/moderate/complex) with different approval paths. We created a clear RACI matrix defining roles at each stage. We established a weekly Change Control Board with representatives from all functions, authorized to approve changes in the meeting. We implemented an eQMS workflow where all stakeholders see requests simultaneously and can comment in parallel. Average change processing time reduced from 7.5 months to 6 weeks for moderate changes and 2 weeks for simple changes—a 75-90% reduction. The company moved from a backlog of 200+ pending changes to current state in 6 months."
      },
      impactMetric: {
        es: "Reducción de 75-90% en tiempo de ciclo de change control (7.5 meses a 6 semanas/2 semanas) • Eliminación de backlog de 200+ cambios pendientes en 6 meses • Mejora de 40% en employee satisfaction relacionado con colaboración",
        en: "75-90% reduction in change control cycle time (7.5 months to 6 weeks/2 weeks) • Elimination of 200+ pending changes backlog in 6 months • 40% improvement in employee satisfaction related to collaboration"
      },
      ctaText: {
        es: "Agendar Consulta: Workshop de Mapeo de Proceso y Identificación de Desperdicios",
        en: "Schedule Consultation: Process Mapping & Waste Identification Workshop"
      }
    },
    {
      icon: Award,
      title: {
        es: "Industry-Specific Expertise",
        en: "Industry-Specific Expertise"
      },
      description: {
        es: "Más de 22 años de experiencia en empresas multinacionales y startups de dispositivos médicos, productos combinados y biotecnología.",
        en: "22+ years of experience in multinational companies and startups in medical devices, combination products, and biotechnology."
      },
      detailedDescription: {
        es: "Navegar las complejidades únicas de dispositivos médicos, productos de combinación, y biotecnología requiere más que conocimiento teórico—requiere experiencia práctica viviendo las presiones de inspecciones regulatorias, lanzamientos de productos bajo deadlines implacables, y la responsabilidad de productos que afectan vidas de pacientes. Con 22+ años de experiencia en compañías multinacionales y startups en todas las etapas de madurez, traemos perspectiva informada por ciclos completos de producto: desde desarrollo inicial y validación, pasando por lanzamiento comercial y scale-up, hasta gestión de post-market surveillance. Nuestra experiencia abarca dispositivos implantables de Clase III, sistemas de diagnóstico in-vitro, productos drug-device combination sujetos a dual compliance GMP/QSR, terapias biológicas con complejidades de raw material sourcing, y dispositivos de consumo con volúmenes masivos. Especializamos en challenges reales: gestión de proveedores globales con diferencias culturales, balance entre cost reduction y quality requirements, navegación de cambios de proveedores sin interrumpir producción, y preparación para inspecciones mientras se mantiene momentum de negocio. Hablamos el lenguaje de la industria y apreciamos las presiones únicas de cada segmento y etapa de madurez empresarial.",
        en: "Navigating the unique complexities of medical devices, combination products, and biotechnology requires more than theoretical knowledge—it requires practical experience living through regulatory inspection pressures, product launches under relentless deadlines, and the responsibility of products affecting patient lives. With 22+ years of experience in multinational companies and startups at all maturity stages, we bring perspective informed by complete product lifecycles: from initial development and validation, through commercial launch and scale-up, to post-market surveillance management. Our experience spans Class III implantable devices, in-vitro diagnostic systems, drug-device combination products subject to dual GMP/QSR compliance, biological therapies with raw material sourcing complexities, and consumer devices with massive volumes. We specialize in real challenges: managing global suppliers with cultural differences, balancing cost reduction with quality requirements, navigating supplier changes without disrupting production, and preparing for inspections while maintaining business momentum. We speak the industry's language and appreciate the unique pressures of each segment and business maturity stage."
      },
      cases: [
        {
          id: "case-1-combination-product-elevation",
          title: {
            es: "Elevación de QMS de Combination Product para Aprobación FDA",
            en: "Combination Product QMS Elevation for FDA Approval"
          },
          situation: {
            es: "Startup exitosa de terapia combination product (biologic-device) con tecnología breakthrough había obtenido aprobaciones regulatorias en Europa (MDD/MDR), Corea, y Japón, demostrando que su sistema de calidad funcionaba efectivamente—cero hallazgos en purchasing controls o supplier management en múltiples inspecciones internacionales durante 2 años. Sin embargo, la empresa reconoció que prepararse para su primer Pre-Market Approval (PMA) con FDA requería elevar su QMS a un nivel superior de rigor, documentación, y controles sistémicos. Si bien el sistema actual cumplía con estándares internacionales, FDA expectations para combination products bajo dual compliance (21 CFR 820 + 21 CFR 600) son notoriamente más exigentes, particularmente en áreas como purchasing controls para raw materials biológicos, validation documentation, design history file completeness, y supplier qualification depth.",
            en: "Successful combination product therapy startup (biologic-device) with breakthrough technology had obtained regulatory approvals in Europe (MDD/MDR), Korea, and Japan, demonstrating their quality system worked effectively—zero findings in purchasing controls or supplier management across multiple international inspections over 2 years. However, the company recognized that preparing for their first Pre-Market Approval (PMA) with FDA required elevating their QMS to a superior level of rigor, documentation, and systemic controls. While their current system met international standards, FDA expectations for combination products under dual compliance (21 CFR 820 + 21 CFR 600) are notoriously more demanding, particularly in areas like purchasing controls for biological raw materials, validation documentation, design history file completeness, and supplier qualification depth."
          },
          solution: {
            es: "Ejecutamos programa estratégico de elevación de QMS durante 24 meses: (1) Realizamos gap assessment comprehensivo comparando sistema actual (exitoso en Europa/Asia) contra FDA expectations específicas para combination products, identificando no deficiencias sino oportunidades de enhancement, (2) Elevamos purchasing controls framework: expandimos supplier risk classification con criterios FDA-specific, enriquecimos supplier qualification packages con documentación adicional anticipando FDA scrutiny, desarrollamos dual-track quality agreements addressing tanto device (21 CFR 820.50) como biologic requirements (21 CFR 600), implementamos enhanced raw material qualification protocols para biological materials con testing más comprehensivo, (3) Fortalecimos validation documentation: creamos validation master plan con scope expandido, completamos retrospective validation documentation para procesos críticos con rigor FDA-level, desarrollamos comprehensive protocols y reports con statistical analysis robusto, (4) Optimizamos design history file: reorganizamos DHF con traceability impecable entre design inputs, verification/validation activities, risk management, y regulatory submissions, agregamos narrative documents explicando design rationale y decision-making process, (5) Implementamos controles sistémicos adicionales: automated supplier blocking en ERP linked a QMS status, enhanced material-supplier traceability systems, computerized system validation per 21 CFR Part 11 y GAMP 5, (6) Preparamos equipo mediante extensive training: educación en FDA inspection expectations y communication style, mock inspections progressively más challenging simulando pre-approval inspection rigor, coaching en providing objective, data-driven responses, (7) Organizamos documentation repository optimizado para FDA inspection: clear indexing, electronic document management con instant retrieval capability, prepared exhibits anticipando inspector requests.",
            en: "We executed strategic QMS elevation program over 24 months: (1) Conducted comprehensive gap assessment comparing current system (successful in Europe/Asia) against FDA-specific expectations for combination products, identifying not deficiencies but enhancement opportunities, (2) Elevated purchasing controls framework: expanded supplier risk classification with FDA-specific criteria, enriched supplier qualification packages with additional documentation anticipating FDA scrutiny, developed dual-track quality agreements addressing both device (21 CFR 820.50) and biologic requirements (21 CFR 600), implemented enhanced raw material qualification protocols for biological materials with more comprehensive testing, (3) Strengthened validation documentation: created validation master plan with expanded scope, completed retrospective validation documentation for critical processes with FDA-level rigor, developed comprehensive protocols and reports with robust statistical analysis, (4) Optimized design history file: reorganized DHF with impeccable traceability between design inputs, verification/validation activities, risk management, and regulatory submissions, added narrative documents explaining design rationale and decision-making process, (5) Implemented additional systemic controls: automated supplier blocking in ERP linked to QMS status, enhanced material-supplier traceability systems, computerized system validation per 21 CFR Part 11 and GAMP 5, (6) Prepared team through extensive training: education in FDA inspection expectations and communication style, progressively more challenging mock inspections simulating pre-approval inspection rigor, coaching in providing objective, data-driven responses, (7) Organized documentation repository optimized for FDA inspection: clear indexing, electronic document management with instant retrieval capability, prepared exhibits anticipating inspector requests."
          },
          results: {
            es: "Track record regulatorio impecable: cero hallazgos en purchasing controls o supplier management en todas las inspecciones internacionales (MDD/MDR, Korea, Japón) durante 2 años—demostración objetiva de sistema robusto. Programa de elevación completado exitosamente preparando empresa para FDA PMA pre-approval inspection con confidence level alto. Sistema mejorado mantiene balance óptimo: cumple con FDA expectations más exigentes sin agregar burocracia innecesaria que comprometería agility de startup. Inversión estratégica en QMS elevation posicionó empresa para: approach a FDA inspection desde posición de strength vs reactive compliance, leverage de track record internacional durante regulatory discussions, capability de demonstrar sustained compliance y continuous improvement culture. Documentación comprehensiva y controles sistémicos desarrollados durante programa sirven como foundation escalable: sistema puede grow con empresa desde startup a commercial-stage sin major overhaul. Equipo transformado: scientists sin experiencia regulatoria desarrollaron deep understanding de FDA expectations, capaces de navigate compliance requirements con confidence, preparados para communicate effectively con inspectors.",
            en: "Impeccable regulatory track record: zero findings in purchasing controls or supplier management across all international inspections (MDD/MDR, Korea, Japan) over 2 years—objective demonstration of robust system. Elevation program completed successfully preparing company for FDA PMA pre-approval inspection with high confidence level. Improved system maintains optimal balance: meets more demanding FDA expectations without adding unnecessary bureaucracy that would compromise startup agility. Strategic investment in QMS elevation positioned company to: approach FDA inspection from position of strength vs reactive compliance, leverage international track record during regulatory discussions, demonstrate sustained compliance and continuous improvement culture capability. Comprehensive documentation and systemic controls developed during program serve as scalable foundation: system can grow with company from startup to commercial-stage without major overhaul. Team transformed: scientists without regulatory experience developed deep understanding of FDA expectations, capable of navigating compliance requirements with confidence, prepared to communicate effectively with inspectors."
          }
        }
      ],
      impactMetric: {
        es: "Track record internacional: 0 hallazgos en purchasing controls en inspecciones MDD/MDR, Korea, Japón (2 años) • Programa de elevación QMS completado preparando para FDA PMA • Sistema optimizado mantiene balance entre rigor FDA y agility de startup",
        en: "International track record: 0 findings in purchasing controls across MDD/MDR, Korea, Japan inspections (2 years) • QMS elevation program completed preparing for FDA PMA • Optimized system maintains balance between FDA rigor and startup agility"
      },
      ctaText: {
        es: "Descargar Caso de Estudio: Elevación de QMS para Aprobación FDA",
        en: "Download Case Study: QMS Elevation for FDA Approval"
      }
    },
    {
      icon: Database,
      title: {
        es: "Master Data Governance & ERP Integration",
        en: "Master Data Governance & ERP Integration"
      },
      description: {
        es: "Frameworks de gobernanza, integración con SAP/ERP, configuración de vendor master controls y ASL, workflows de qualification y change control.",
        en: "Governance frameworks, SAP/ERP integration, vendor master controls and ASL configuration, qualification and change control workflows."
      },
      detailedDescription: {
        es: "Master data—supplier records, material masters, bills of material—es el fundamento invisible que determina si sus purchasing controls funcionan en la realidad o solo existen en papel. Nuestros servicios de gobernanza de master data transforman cumplimiento regulatorio de actividades manuales propensas a error en controles sistémicos automáticos que previenen nonconformances antes de que ocurran. Diseñamos frameworks de data governance que definen ownership claro: quién puede crear, modificar, y aprobar cada tipo de master data; qué validaciones y approvals son requeridos; cómo se documentan decisiones; y cómo audit trails capturan cada modificación. Especializamos en integración profunda entre sistemas eQMS y ERP (particularmente SAP, pero también Oracle, xTuple, y otros). Cuando un supplier es bloqueado en el QMS por un audit finding, esa decisión se propaga automáticamente al ERP, previniendo que Procurement cree purchase orders. Implementamos controles preventivos directamente en workflows de ERP: source lists que restringen compras solo a proveedores aprobados, inspection plans que automáticamente generan inspection lots basados en supplier risk classification, y approval routes que requieren Quality sign-off para compras críticas. Convertimos data de liability en asset estratégico.",
        en: "Master data—supplier records, material masters, bills of material—is the invisible foundation that determines whether your purchasing controls work in reality or only exist on paper. Our master data governance services transform regulatory compliance from error-prone manual activities into automatic systemic controls that prevent nonconformances before they occur. We design data governance frameworks that define clear ownership: who can create, modify, and approve each type of master data; what validations and approvals are required; how decisions are documented; and how audit trails capture each modification. We specialize in deep integration between eQMS and ERP systems (particularly SAP, but also Oracle, xTuple, and others). When a supplier is blocked in the QMS due to an audit finding, that decision automatically propagates to the ERP, preventing Procurement from creating purchase orders. We implement preventive controls directly in ERP workflows: source lists that restrict purchases only to approved suppliers, inspection plans that automatically generate inspection lots based on supplier risk classification, and approval routes that require Quality sign-off for critical purchases. We convert data from liability into strategic asset."
      },
      realCase: {
        es: "Un fabricante de dispositivos cardiovasculares operaba SAP sin controles robustos en vendor masters. Procurement podía crear vendors sin involvement de Quality, resultando en compras ocasionales de suppliers no calificados cuando presiones de supply chain urgían. No existía linkage sistemático entre supplier approval status en el QMS y vendor status en SAP. Una auditoría de Notified Body identificó múltiples casos de compras de materiales críticos de suppliers sin documentación de evaluación, citando esto como major nonconformance. Implementamos governance y controles técnicos integrales: (1) removimos authorizations de Procurement para crear vendors, (2) configuramos custom fields en vendor master linked a supplier status en QMS, (3) desarrollamos interface automática donde cambios de supplier status en QMS disparan updates a SAP purchasing blocks, (4) implementamos source lists forzando que materials críticos solo puedan comprarse de suppliers aprobados específicos, y (5) creamos approval workflow donde POs para materiales críticos requieren Quality signature antes de release. La empresa no ha tenido una sola compra de supplier no-aprobado desde implementación (36+ meses).",
        en: "A cardiovascular device manufacturer operated SAP without robust vendor master controls. Procurement could create vendors without Quality involvement, resulting in occasional purchases from unqualified suppliers when supply chain pressures were urgent. There was no systematic linkage between supplier approval status in the QMS and vendor status in SAP. A Notified Body audit identified multiple cases of critical material purchases from suppliers without evaluation documentation, citing this as a major nonconformance. We implemented comprehensive governance and technical controls: (1) removed Procurement authorizations to create vendors, (2) configured custom fields in vendor master linked to supplier status in QMS, (3) developed automatic interface where supplier status changes in QMS trigger SAP purchasing blocks updates, (4) implemented source lists forcing critical materials can only be purchased from specific approved suppliers, and (5) created approval workflow where POs for critical materials require Quality signature before release. The company has had not a single purchase from unapproved supplier since implementation (36+ months)."
      },
      impactMetric: {
        es: "100% eliminación de compras no-conformes de suppliers no-aprobados (de 8-12/año a 0) • Reducción de 85% en tiempo de respuesta para bloqueo de suppliers (de 3-5 días a 15 minutos) • Ahorro de $250K anuales en labor de reconciliación manual",
        en: "100% elimination of non-conforming purchases from unapproved suppliers (from 8-12/year to 0) • 85% reduction in supplier blocking response time (from 3-5 days to 15 minutes) • $250K annual savings in manual reconciliation labor"
      },
      ctaText: {
        es: "Agendar Consulta: Assessment de Madurez de Data Governance y Oportunidades de Integración ERP",
        en: "Schedule Consultation: Data Governance Maturity Assessment & ERP Integration Opportunities"
      }
    },
  ];

  const resources = [
    {
      title: language === "es" ? "Guía Completa de Purchasing Controls" : "Complete Purchasing Controls Guide",
      description: language === "es"
        ? "Framework completo de 40+ páginas con experiencia práctica en gestión de proveedores y compliance."
        : "Complete 40+ page framework with practical experience in supplier management and compliance.",
      slug: "purchasing-controls-guide",
    },
    {
      title: language === "es" ? "Framework de Master Data Governance" : "Master Data Governance Framework",
      description: language === "es"
        ? "Guía paso a paso para implementar gobernanza de datos maestros en sistemas ERP."
        : "Step-by-step guide to implement master data governance in ERP systems.",
      slug: "master-data-governance",
    },
    {
      title: language === "es" ? "Checklist de FDA/ISO/MDR Compliance" : "FDA/ISO/MDR Compliance Checklist",
      description: language === "es"
        ? "Checklist detallado para preparación y remediación de auditorías regulatorias."
        : "Detailed checklist for regulatory audit preparation and remediation.",
      slug: "compliance-checklist",
    },
    {
      title: language === "es" ? "De Procedimientos a Controles Automatizados" : "From Procedures to Automated Controls",
      description: language === "es"
        ? "Guía de transformación digital: cómo pasar de procedimientos manuales a controles automatizados en eQMS."
        : "Digital transformation guide: transitioning from manual procedures to automated controls in eQMS.",
      slug: "automated-controls-guide",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Jíbaro en la Luna Consulting
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {language === "es"
                ? "Consultoría especializada en gestión de datos maestros, integración de ERP, calidad digital, cumplimiento normativo y gestión de riesgos. Más de 22 años de experiencia en la industria de dispositivos médicos, productos combinados y biotecnología."
                : "Specialized consulting in master data management, ERP integration, digital quality, regulatory compliance, and risk management. 22+ years of experience in the medical device, combination products, and biotechnology industries."}
            </p>
          </div>

          {/* Process Flow Diagram */}
          <div className="mb-16 p-8 bg-card rounded-lg shadow-lg border border-border">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                <Shield className="w-12 h-12 text-primary" />
                <span className="font-semibold">Compliance</span>
              </div>
              <div className="hidden md:block text-4xl text-muted-foreground">→</div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-12 h-12 text-primary" />
                <span className="font-semibold">eQMS</span>
              </div>
              <div className="hidden md:block text-4xl text-muted-foreground">→</div>
              <div className="flex items-center gap-3">
                <Database className="w-12 h-12 text-primary" />
                <div className="flex flex-col">
                  <span className="font-semibold">Master Data</span>
                  <span className="text-sm text-muted-foreground">& ERP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            {language === "es" ? "Servicios y Áreas de Experiencia" : "Services & Areas of Expertise"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{service.title[language]}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed">
                      {service.description[language]}
                    </CardDescription>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          {language === "es" ? "Saber más" : "Learn More"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                          <DialogTitle className="text-2xl mb-4">{service.title[language]}</DialogTitle>
                          <DialogDescription asChild>
                            <div className="space-y-6">
                              {/* Descripción detallada */}
                              <p className="text-base text-foreground/90 leading-relaxed">
                                {service.detailedDescription[language]}
                              </p>
                              
                              {/* Casos de éxito */}
                              {service.cases && service.cases.length > 0 && (
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    {language === "es" ? "Casos de Éxito Reales" : "Real Success Cases"}
                                  </h4>
                                  {service.cases.map((caseStudy) => (
                                    <div key={caseStudy.id} className="bg-muted/50 p-5 rounded-lg border border-border space-y-3">
                                      <h5 className="font-semibold text-primary">
                                        {caseStudy.title[language]}
                                      </h5>
                                      
                                      <div>
                                        <p className="text-xs font-medium text-foreground/70 mb-1">
                                          {language === "es" ? "Situación:" : "Situation:"}
                                        </p>
                                        <p className="text-sm text-foreground/80 leading-relaxed">
                                          {caseStudy.situation[language]}
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-xs font-medium text-foreground/70 mb-1">
                                          {language === "es" ? "Solución:" : "Solution:"}
                                        </p>
                                        <p className="text-sm text-foreground/80 leading-relaxed">
                                          {caseStudy.solution[language]}
                                        </p>
                                      </div>

                                      <div className="bg-primary/5 p-3 rounded border border-primary/10">
                                        <p className="text-xs font-medium text-foreground/70 mb-1">
                                          {language === "es" ? "Resultados:" : "Results:"}
                                        </p>
                                        <p className="text-sm text-foreground/90 leading-relaxed">
                                          {caseStudy.results[language]}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Métricas de impacto */}
                              {service.impactMetric && (
                                <div className="bg-primary/5 p-5 rounded-lg border border-primary/20">
                                  <h4 className="font-semibold text-foreground mb-3">
                                    {language === "es" ? "Resultados Medibles" : "Measurable Results"}
                                  </h4>
                                  <p className="text-sm text-foreground/90 leading-relaxed">
                                    {service.impactMetric[language]}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                          <Button className="flex-1">
                            {language === "es" ? "Agendar Consulta" : "Schedule Consultation"}
                          </Button>
                          <Button variant="outline" className="flex-1">
                            {service.ctaText ? service.ctaText[language] : (language === "es" ? "Descargar Recursos" : "Download Resources")}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resources Section with Lead Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            {language === "es" ? "Recursos Descargables" : "Downloadable Resources"}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {language === "es"
              ? "Acceso instantáneo al framework completo. Completa el formulario para recibir tu descarga."
              : "Instant access to the complete framework. Fill out the form to receive your download."}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resources List */}
            <div className="space-y-4">
              {resources.map((resource, index) => (
                <Card key={index} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Download className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Lead Capture Form */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>
                  {language === "es" ? "Acceso Instantáneo" : "Instant Access"}
                </CardTitle>
                <CardDescription>
                  {language === "es"
                    ? "Completa el formulario para recibir todos los recursos en tu email"
                    : "Complete the form to receive all resources in your email"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leadSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {language === "es" ? "¡Revisa tu email!" : "Check your email!"}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === "es"
                        ? "Te hemos enviado el acceso a todos los recursos."
                        : "We've sent you access to all resources."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleLeadSubmit(e, "All Resources Package")} className="space-y-4">
                    <div>
                      <Label htmlFor="lead-name">{language === "es" ? "Nombre" : "Name"} *</Label>
                      <Input
                        id="lead-name"
                        required
                        value={leadFormData.name}
                        onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lead-email">{language === "es" ? "Email Corporativo" : "Corporate Email"} *</Label>
                      <Input
                        id="lead-email"
                        type="email"
                        required
                        value={leadFormData.email}
                        onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lead-company">{language === "es" ? "Empresa" : "Company"} *</Label>
                      <Input
                        id="lead-company"
                        required
                        value={leadFormData.company}
                        onChange={(e) => setLeadFormData({ ...leadFormData, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lead-role">{language === "es" ? "Rol/Título" : "Role/Title"} *</Label>
                      <Select
                        value={leadFormData.role}
                        onValueChange={(value) => setLeadFormData({ ...leadFormData, role: value })}
                      >
                        <SelectTrigger id="lead-role">
                          <SelectValue placeholder={language === "es" ? "Selecciona tu rol" : "Select your role"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quality-manager">Quality Manager</SelectItem>
                          <SelectItem value="sqe">SQE / Supplier Quality Engineer</SelectItem>
                          <SelectItem value="director">Director / VP</SelectItem>
                          <SelectItem value="purchasing">Purchasing / Procurement</SelectItem>
                          <SelectItem value="compliance">Compliance / Regulatory</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lead-company-size">{language === "es" ? "Tamaño de Empresa" : "Company Size"}</Label>
                      <Select
                        value={leadFormData.companySize}
                        onValueChange={(value) => setLeadFormData({ ...leadFormData, companySize: value })}
                      >
                        <SelectTrigger id="lead-company-size">
                          <SelectValue placeholder={language === "es" ? "Selecciona tamaño" : "Select size"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup (&lt;50)</SelectItem>
                          <SelectItem value="medium">Mediana (50-500)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (&gt;500)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lead-industry">{language === "es" ? "Industria" : "Industry"}</Label>
                      <Select
                        value={leadFormData.industry}
                        onValueChange={(value) => setLeadFormData({ ...leadFormData, industry: value })}
                      >
                        <SelectTrigger id="lead-industry">
                          <SelectValue placeholder={language === "es" ? "Selecciona industria" : "Select industry"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical-devices">Medical Devices</SelectItem>
                          <SelectItem value="combination-products">Combination Products</SelectItem>
                          <SelectItem value="pharma">Pharma / Biotech</SelectItem>
                          <SelectItem value="ivd">In-Vitro Diagnostics</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lead-challenge">{language === "es" ? "Principal Desafío (opcional)" : "Main Challenge (optional)"}</Label>
                      <Textarea
                        id="lead-challenge"
                        rows={3}
                        value={leadFormData.mainChallenge}
                        onChange={(e) => setLeadFormData({ ...leadFormData, mainChallenge: e.target.value })}
                        placeholder={language === "es" ? "Cuéntanos tu mayor desafío..." : "Tell us your biggest challenge..."}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmittingLead}>
                      {isSubmittingLead
                        ? (language === "es" ? "Enviando..." : "Submitting...")
                        : (language === "es" ? "Obtener Acceso Instantáneo" : "Get Instant Access")}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-secondary/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            {language === "es" ? "¿Necesitas Asesoría Personalizada?" : "Need Personalized Consulting?"}
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            {language === "es"
              ? "Contáctanos para discutir cómo podemos ayudar a tu organización"
              : "Contact us to discuss how we can help your organization"}
          </p>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-name">{language === "es" ? "Nombre" : "Name"} *</Label>
                    <Input
                      id="contact-name"
                      required
                      value={contactFormData.name}
                      onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">{language === "es" ? "Email" : "Email"} *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact-message">{language === "es" ? "Mensaje" : "Message"} *</Label>
                  <Textarea
                    id="contact-message"
                    rows={6}
                    required
                    value={contactFormData.message}
                    onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                    placeholder={language === "es" ? "Describe tu proyecto o necesidad..." : "Describe your project or need..."}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmittingContact}>
                  <Mail className="w-4 h-4 mr-2" />
                  {isSubmittingContact
                    ? (language === "es" ? "Enviando..." : "Sending...")
                    : (language === "es" ? "Enviar Consulta" : "Send Inquiry")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Consulting;

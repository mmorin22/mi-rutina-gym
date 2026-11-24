import React from 'react';
import type { SvgPostureType } from '../types';

interface ExerciseSvgFallbackProps {
  type: SvgPostureType;
  primaryMuscles: string[];
  className?: string;
}

/**
 * Ilustración SVG biomecánica minimalista de respaldo offline.
 * Muestra banco/máquina/estructura en gris técnico, cuerpo articulado claro,
 * músculos objetivo iluminados en verde neón (#a3e635) y vector de movimiento (#38bdf8).
 */
export const ExerciseSvgFallback: React.FC<ExerciseSvgFallbackProps> = ({
  type,
  primaryMuscles,
  className = '',
}) => {
  const renderScene = () => {
    switch (type) {
      case 'bench-press':
        return (
          <g>
            {/* Banco plano y soporte */}
            <rect x="45" y="132" width="145" height="8" rx="4" fill="#3f3f46" />
            <line x1="65" y1="140" x2="65" y2="175" stroke="#3f3f46" strokeWidth="6" strokeLinecap="round" />
            <line x1="170" y1="140" x2="170" y2="175" stroke="#3f3f46" strokeWidth="6" strokeLinecap="round" />
            <line x1="78" y1="75" x2="78" y2="140" stroke="#52525b" strokeWidth="5" />
            {/* Cuerpo tumbado */}
            <circle cx="72" cy="120" r="11" fill="#e4e4e7" />
            <line x1="84" y1="123" x2="155" y2="125" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
            {/* Pectoral activo en neón */}
            <ellipse cx="104" cy="118" rx="16" ry="7" fill="#a3e635" opacity="0.92" />
            {/* Piernas apoyadas */}
            <polyline points="155,125 188,128 198,172" fill="none" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            {/* Brazo empujando barra */}
            <polyline points="102,120 98,95 98,68" fill="none" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Barra con discos */}
            <line x1="68" y1="66" x2="128" y2="66" stroke="#f4f4f5" strokeWidth="4" strokeLinecap="round" />
            <rect x="74" y="52" width="7" height="28" rx="2" fill="#38bdf8" />
            <rect x="115" y="52" width="7" height="28" rx="2" fill="#38bdf8" />
            {/* Vector fuerza */}
            <path d="M142 102 L142 64 M136 72 L142 64 L148 72" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'incline-press':
        return (
          <g>
            {/* Banco inclinado 30-35° */}
            <line x1="65" y1="92" x2="138" y2="145" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
            <line x1="138" y1="145" x2="168" y2="138" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
            <line x1="95" y1="115" x2="85" y2="175" stroke="#3f3f46" strokeWidth="5" />
            <line x1="150" y1="144" x2="155" y2="175" stroke="#3f3f46" strokeWidth="5" />
            {/* Cuerpo */}
            <circle cx="80" cy="82" r="11" fill="#e4e4e7" />
            <line x1="88" y1="92" x2="136" y2="136" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
            {/* Pectoral clavicular + deltoides anterior activos */}
            <ellipse cx="102" cy="99" rx="14" ry="7" transform="rotate(38 102 99)" fill="#a3e635" />
            <polyline points="136,136 174,132 188,172" fill="none" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            {/* Brazo vertical empujando */}
            <line x1="98" y1="96" x2="98" y2="54" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" />
            <rect x="84" y="46" width="28" height="10" rx="3" fill="#38bdf8" />
            <path d="M126 88 L126 52 M120 60 L126 52 L132 60" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'lat-pulldown':
        return (
          <g>
            {/* Torre de polea alta */}
            <line x1="72" y1="25" x2="72" y2="175" stroke="#3f3f46" strokeWidth="6" />
            <line x1="72" y1="28" x2="138" y2="28" stroke="#52525b" strokeWidth="6" strokeLinecap="round" />
            <line x1="132" y1="28" x2="132" y2="58" stroke="#71717a" strokeWidth="2.5" strokeDasharray="3 2" />
            <line x1="102" y1="58" x2="162" y2="58" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            {/* Asiento y rodilleras */}
            <rect x="115" y="138" width="42" height="7" rx="3" fill="#3f3f46" />
            <circle cx="112" cy="126" r="6" fill="#52525b" />
            {/* Torso ligeramente reclinado */}
            <circle cx="144" cy="86" r="10" fill="#e4e4e7" />
            <line x1="142" y1="98" x2="134" y2="136" stroke="#d4d4d8" strokeWidth="13" strokeLinecap="round" />
            {/* Dorsal ancho iluminado */}
            <path d="M132 100 Q148 112 139 132 L130 130 Z" fill="#a3e635" />
            {/* Brazos tirando */}
            <polyline points="138,100 120,82 114,58" fill="none" stroke="#a3e635" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="134,136 104,136 102,172" fill="none" stroke="#a1a1aa" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M174 56 L174 94 M168 86 L174 94 L180 86" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'chest-supported-row':
      case 'unilateral-row':
        return (
          <g>
            {/* Banco inclinado soporte pecho */}
            <line x1="85" y1="84" x2="152" y2="136" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
            <line x1="100" y1="96" x2="90" y2="175" stroke="#3f3f46" strokeWidth="5" />
            <line x1="144" y1="130" x2="152" y2="175" stroke="#3f3f46" strokeWidth="5" />
            {/* Torso apoyado boca abajo */}
            <circle cx="84" cy="70" r="10" fill="#e4e4e7" />
            <line x1="94" y1="79" x2="142" y2="122" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
            {/* Espalda media / dorsal activo */}
            <ellipse cx="115" cy="94" rx="16" ry="6" transform="rotate(40 115 94)" fill="#a3e635" />
            <line x1="142" y1="122" x2="176" y2="170" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" />
            {/* Brazo traccionando codo atrás */}
            <polyline points="104,88 122,74 114,116" fill="none" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="102" y="116" width="24" height="9" rx="3" fill="#38bdf8" />
            <path d="M72 132 L92 104 M83 106 L92 104 L92 113" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'cable-lateral-raise':
        return (
          <g>
            {/* Columna de polea baja */}
            <line x1="66" y1="30" x2="66" y2="175" stroke="#3f3f46" strokeWidth="7" strokeLinecap="round" />
            {/* Cable cruzado desde abajo */}
            <line x1="68" y1="164" x2="176" y2="86" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 2" />
            {/* Cuerpo inclinado estilo Egyptian */}
            <circle cx="122" cy="56" r="11" fill="#e4e4e7" />
            <line x1="120" y1="69" x2="108" y2="122" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
            <line x1="118" y1="74" x2="68" y2="86" stroke="#a1a1aa" strokeWidth="6" strokeLinecap="round" />
            {/* Deltoides lateral iluminado */}
            <circle cx="128" cy="74" r="9" fill="#a3e635" />
            <line x1="128" y1="74" x2="176" y2="86" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" />
            {/* Piernas */}
            <line x1="108" y1="122" x2="98" y2="174" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" />
            <line x1="108" y1="122" x2="122" y2="174" stroke="#a1a1aa" strokeWidth="8" strokeLinecap="round" />
            <path d="M164 118 Q182 96 174 68 M168 75 L174 68 L180 74" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'preacher-curl':
      case 'hammer-curl':
        return (
          <g>
            {type === 'preacher-curl' && (
              <>
                <polygon points="116,92 146,126 116,126" fill="#3f3f46" />
                <line x1="128" y1="126" x2="128" y2="174" stroke="#3f3f46" strokeWidth="6" />
              </>
            )}
            <circle cx="96" cy="58" r="11" fill="#e4e4e7" />
            <line x1="96" y1="72" x2="94" y2="128" stroke="#d4d4d8" strokeWidth="13" strokeLinecap="round" />
            <line x1="94" y1="128" x2="94" y2="174" stroke="#a1a1aa" strokeWidth="10" strokeLinecap="round" />
            {/* Bíceps / braquial iluminado */}
            <line x1="100" y1="78" x2="128" y2="108" stroke="#a3e635" strokeWidth="9" strokeLinecap="round" />
            <line x1="128" y1="108" x2="154" y2="78" stroke="#e4e4e7" strokeWidth="7" strokeLinecap="round" />
            <circle cx="158" cy="74" r="8" fill="#38bdf8" />
            <path d="M164 114 Q176 88 158 62 M154 70 L158 62 L166 66" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'overhead-triceps':
      case 'triceps-pushdown':
        return (
          <g>
            {/* Torre polea */}
            <line x1="68" y1="26" x2="68" y2="174" stroke="#3f3f46" strokeWidth="7" />
            {type === 'overhead-triceps' ? (
              <>
                <line x1="70" y1="142" x2="118" y2="54" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 2" />
                <circle cx="132" cy="68" r="11" fill="#e4e4e7" />
                <line x1="130" y1="82" x2="124" y2="132" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
                <line x1="124" y1="132" x2="118" y2="174" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" />
                <line x1="124" y1="132" x2="142" y2="174" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" />
                {/* Brazo elevado con cabeza larga activa */}
                <line x1="128" y1="82" x2="118" y2="48" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" />
                <line x1="118" y1="48" x2="148" y2="34" stroke="#f4f4f5" strokeWidth="6" strokeLinecap="round" />
                <path d="M142 58 L162 34 M153 35 L162 34 L161 43" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="70" y1="30" x2="112" y2="96" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 2" />
                <circle cx="132" cy="56" r="11" fill="#e4e4e7" />
                <line x1="132" y1="70" x2="136" y2="124" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
                <line x1="136" y1="124" x2="134" y2="174" stroke="#a1a1aa" strokeWidth="10" strokeLinecap="round" />
                {/* Codo fijo y tríceps extendiendo hacia abajo */}
                <line x1="130" y1="74" x2="124" y2="104" stroke="#a3e635" strokeWidth="8" strokeLinecap="round" />
                <line x1="124" y1="104" x2="108" y2="132" stroke="#f4f4f5" strokeWidth="6" strokeLinecap="round" />
                <path d="M96 98 L96 136 M90 128 L96 136 L102 128" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'dips':
        return (
          <g>
            {/* Barras paralelas */}
            <line x1="78" y1="106" x2="162" y2="106" stroke="#52525b" strokeWidth="6" strokeLinecap="round" />
            <line x1="90" y1="106" x2="90" y2="174" stroke="#3f3f46" strokeWidth="5" />
            <line x1="150" y1="106" x2="150" y2="174" stroke="#3f3f46" strokeWidth="5" />
            {/* Torso inclinado 30° */}
            <circle cx="102" cy="56" r="11" fill="#e4e4e7" />
            <line x1="108" y1="68" x2="132" y2="116" stroke="#d4d4d8" strokeWidth="13" strokeLinecap="round" />
            <ellipse cx="114" cy="84" rx="11" ry="6" transform="rotate(60 114 84)" fill="#a3e635" />
            {/* Brazo flexionado empujando */}
            <polyline points="114,74 138,80 124,106" fill="none" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Piernas flexionadas atrás */}
            <polyline points="132,116 138,148 160,144" fill="none" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M72 92 L72 56 M66 64 L72 56 L78 64" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'reverse-pec-deck':
        return (
          <g>
            {/* Vista superior / torso erguido frente a máquina */}
            <rect x="82" y="42" width="10" height="128" rx="4" fill="#3f3f46" />
            <circle cx="122" cy="56" r="11" fill="#e4e4e7" />
            <line x1="122" y1="70" x2="122" y2="130" stroke="#d4d4d8" strokeWidth="13" strokeLinecap="round" />
            <polyline points="122,130 98,132 96,172" fill="none" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" />
            {/* Deltoides posterior iluminado */}
            <circle cx="126" cy="78" r="9" fill="#a3e635" />
            <line x1="126" y1="78" x2="174" y2="82" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" />
            <path d="M104 60 Q148 54 176 76 M168 78 L176 76 L173 68" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'hack-squat':
      case 'leg-press':
        return (
          <g>
            {type === 'hack-squat' ? (
              <>
                {/* Raíl inclinado Hack Squat */}
                <line x1="68" y1="42" x2="168" y2="168" stroke="#3f3f46" strokeWidth="7" strokeLinecap="round" />
                <line x1="146" y1="168" x2="184" y2="140" stroke="#52525b" strokeWidth="8" strokeLinecap="round" />
                <circle cx="92" cy="58" r="10" fill="#e4e4e7" />
                <line x1="98" y1="70" x2="128" y2="110" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
                {/* Cuádriceps en máxima flexión de rodilla */}
                <line x1="128" y1="110" x2="166" y2="104" stroke="#a3e635" strokeWidth="11" strokeLinecap="round" />
                <line x1="166" y1="104" x2="164" y2="152" stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round" />
                <path d="M126 54 L98 28 M98 37 L98 28 L107 29" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Prensa 45° */}
                <line x1="58" y1="158" x2="105" y2="158" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
                <line x1="58" y1="158" x2="46" y2="112" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
                <line x1="138" y1="54" x2="184" y2="110" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
                <circle cx="62" cy="108" r="10" fill="#e4e4e7" />
                <line x1="68" y1="120" x2="94" y2="150" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
                {/* Cuádriceps + glúteo activos */}
                <circle cx="96" cy="150" r="8" fill="#a3e635" />
                <line x1="96" y1="150" x2="116" y2="106" stroke="#a3e635" strokeWidth="11" strokeLinecap="round" />
                <line x1="116" y1="106" x2="158" y2="86" stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round" />
                <path d="M144 126 L176 102 M167 101 L176 102 L173 111" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'leg-extension':
      case 'seated-leg-curl':
        return (
          <g>
            {/* Silla máquina */}
            <polyline points="72,72 78,128 128,128" fill="none" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="98" y1="128" x2="98" y2="174" stroke="#3f3f46" strokeWidth="6" />
            <circle cx="88" cy="64" r="10" fill="#e4e4e7" />
            <line x1="88" y1="76" x2="92" y2="120" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
            {/* Muslo con recto femoral o isquio activo */}
            <line x1="92" y1="120" x2="138" y2="120" stroke="#a3e635" strokeWidth="12" strokeLinecap="round" />
            {type === 'leg-extension' ? (
              <>
                <line x1="138" y1="120" x2="182" y2="106" stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round" />
                <circle cx="178" cy="108" r="6" fill="#38bdf8" />
                <path d="M158 152 Q178 134 178 92 M172 100 L178 92 L184 100" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="138" y1="120" x2="126" y2="166" stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round" />
                <circle cx="128" cy="162" r="6" fill="#38bdf8" />
                <path d="M168 124 Q162 156 136 168 M145 170 L136 168 L141 160" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'lying-leg-curl':
        return (
          <g>
            {/* Banco prono */}
            <polyline points="56,136 122,126 178,136" fill="none" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
            <line x1="82" y1="132" x2="82" y2="174" stroke="#3f3f46" strokeWidth="5" />
            <line x1="158" y1="134" x2="158" y2="174" stroke="#3f3f46" strokeWidth="5" />
            <circle cx="66" cy="116" r="10" fill="#e4e4e7" />
            <line x1="78" y1="120" x2="124" y2="116" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
            {/* Isquiosurales activos */}
            <line x1="124" y1="116" x2="164" y2="124" stroke="#a3e635" strokeWidth="11" strokeLinecap="round" />
            <line x1="164" y1="124" x2="144" y2="80" stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round" />
            <circle cx="146" cy="84" r="6" fill="#38bdf8" />
            <path d="M180 112 Q174 82 152 72 M161 70 L152 72 L156 80" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'rdl':
        return (
          <g>
            {/* Bisagra de cadera RDL */}
            <circle cx="164" cy="68" r="11" fill="#e4e4e7" />
            <line x1="152" y1="74" x2="96" y2="96" stroke="#d4d4d8" strokeWidth="13" strokeLinecap="round" />
            {/* Glúteo e isquiosurales iluminados */}
            <circle cx="94" cy="98" r="10" fill="#a3e635" />
            <line x1="94" y1="98" x2="108" y2="136" stroke="#a3e635" strokeWidth="11" strokeLinecap="round" />
            <line x1="108" y1="136" x2="108" y2="172" stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round" />
            {/* Brazos rectos sujetando barra rozando espinillas */}
            <line x1="142" y1="80" x2="134" y2="136" stroke="#a1a1aa" strokeWidth="6" strokeLinecap="round" />
            <circle cx="134" cy="140" r="14" fill="#18181b" stroke="#38bdf8" strokeWidth="5" />
            <path d="M84 74 L58 74 M66 68 L58 74 L66 80" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'hip-thrust':
        return (
          <g>
            {/* Cajón / banco */}
            <rect x="48" y="116" width="38" height="56" rx="5" fill="#3f3f46" />
            <circle cx="72" cy="98" r="10" fill="#e4e4e7" />
            {/* Torso y fémur horizontales en bloqueo superior */}
            <line x1="82" y1="108" x2="128" y2="108" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
            {/* Glúteo en contracción máxima */}
            <ellipse cx="128" cy="112" rx="14" ry="9" fill="#a3e635" />
            <line x1="128" y1="108" x2="168" y2="110" stroke="#e4e4e7" strokeWidth="11" strokeLinecap="round" />
            {/* Tibia vertical 90° */}
            <line x1="168" y1="110" x2="168" y2="172" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" />
            {/* Barra en cadera */}
            <circle cx="128" cy="96" r="11" fill="#18181b" stroke="#38bdf8" strokeWidth="4" />
            <path d="M128 148 L128 124 M122 132 L128 124 L134 132" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'bulgarian-squat':
        return (
          <g>
            {/* Banco trasero para empeine */}
            <rect x="162" y="132" width="32" height="40" rx="4" fill="#3f3f46" />
            <circle cx="106" cy="52" r="10" fill="#e4e4e7" />
            <line x1="106" y1="64" x2="114" y2="114" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
            {/* Pierna delantera activa (glúteo + cuádriceps) */}
            <circle cx="114" cy="116" r="9" fill="#a3e635" />
            <line x1="114" y1="114" x2="82" y2="124" stroke="#a3e635" strokeWidth="11" strokeLinecap="round" />
            <line x1="82" y1="124" x2="84" y2="172" stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round" />
            {/* Pierna trasera apoyada */}
            <polyline points="114,114 138,148 168,132" fill="none" stroke="#71717a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            {/* Mancuerna */}
            <line x1="110" y1="74" x2="110" y2="122" stroke="#a1a1aa" strokeWidth="6" strokeLinecap="round" />
            <rect x="100" y="120" width="20" height="9" rx="2" fill="#38bdf8" />
          </g>
        );

      case 'standing-calf':
      case 'seated-calf':
        return (
          <g>
            {/* Escalón para rango completo */}
            <rect x="82" y="158" width="54" height="16" rx="3" fill="#3f3f46" />
            <circle cx="116" cy="46" r="10" fill="#e4e4e7" />
            <line x1="116" y1="58" x2="116" y2="106" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
            <line x1="116" y1="106" x2="116" y2="132" stroke="#a1a1aa" strokeWidth="10" strokeLinecap="round" />
            {/* Gemelo / sóleo iluminado */}
            <ellipse cx="121" cy="138" rx="7" ry="13" fill="#a3e635" />
            <polyline points="116,132 116,154 98,158" fill="none" stroke="#e4e4e7" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M148 158 L148 118 M142 126 L148 118 L154 126" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'cable-crunch':
      case 'hanging-leg-raise':
        return (
          <g>
            {type === 'cable-crunch' ? (
              <>
                <line x1="68" y1="26" x2="68" y2="174" stroke="#3f3f46" strokeWidth="7" />
                <line x1="70" y1="32" x2="112" y2="88" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 2" />
                <circle cx="114" cy="96" r="10" fill="#e4e4e7" />
                {/* Columna flexionada activa */}
                <path d="M122 102 Q148 110 144 140" fill="none" stroke="#a3e635" strokeWidth="12" strokeLinecap="round" />
                <polyline points="144,140 132,168 168,168" fill="none" stroke="#a1a1aa" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M102 68 Q94 98 112 122 M104 120 L112 122 L113 114" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Barra dominadas */}
                <line x1="78" y1="30" x2="162" y2="30" stroke="#52525b" strokeWidth="6" strokeLinecap="round" />
                <line x1="118" y1="30" x2="118" y2="68" stroke="#a1a1aa" strokeWidth="7" strokeLinecap="round" />
                <circle cx="118" cy="62" r="10" fill="#e4e4e7" />
                {/* Torso y abdomen activo */}
                <line x1="118" y1="74" x2="118" y2="118" stroke="#a3e635" strokeWidth="12" strokeLinecap="round" />
                {/* Piernas elevadas con retroversión pélvica */}
                <polyline points="118,118 158,104 176,88" fill="none" stroke="#e4e4e7" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M158 148 Q182 122 176 76 M170 84 L176 76 L182 83" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}
          </g>
        );
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-800/80 overflow-hidden ${className}`}
    >
      {/* Cuadrícula técnica sutil */}
      <svg
        viewBox="0 0 240 195"
        className="w-full h-52 select-none"
        role="img"
        aria-label={`Esquema biomecánico: ${primaryMuscles.join(', ')}`}
      >
        <defs>
          <pattern id="gymGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#27272a"
              strokeWidth="0.6"
              opacity="0.55"
            />
          </pattern>
        </defs>
        <rect width="240" height="195" fill="url(#gymGrid)" />
        {/* Suelo */}
        <line x1="24" y1="175" x2="216" y2="175" stroke="#27272a" strokeWidth="2" />
        {renderScene()}
      </svg>

      {/* Leyenda inferior del esquema */}
      <div className="w-full px-3 py-2 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-400 inline-block shadow-[0_0_8px_#a3e635]" />
          Foco muscular activo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
          Vector concéntrico
        </span>
      </div>
    </div>
  );
};

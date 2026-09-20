from pathlib import Path
import json,html,textwrap,math
ROOT=Path(__file__).resolve().parents[1]
(ROOT/'escenas').mkdir(parents=True,exist_ok=True)
SC=[]
def n(label,body,tag=''): return [label,body,tag]
def s(ch,phase,title,request,caption,nodes,edges=None,dur=8):
 if edges is None: edges=[['a','b',''],['b','c',''],['c','d','']][:len(nodes)-1]
 SC.append(dict(ch=ch,phase=phase,title=title,request=request,caption=caption,nodes=nodes,edges=edges,dur=dur))
# Every result below is explicitly an illustrative simulation, not a tool execution.
s('El sistema','ODD','Una petición pone todo en marcha','«Quiero un cambio que funcione y pueda comprobar.»','Simulación didáctica basada en fuentes oficiales. Los comandos, resultados y cifras de los ejemplos son ilustrativos.',[
 n('Persona','Describe el resultado','INTENCIÓN'),n('Gentle Shell','Orquesta sobre Pi','ENTORNO'),n('Pi + modelo','Razona y usa herramientas','EJECUCIÓN'),n('Código + evidencia','Resultados verificables','SALIDA')])
s('El sistema','ODD','Cada pieza tiene una responsabilidad','«¿Quién decide qué pasa por detrás?»','Gentle AI configura el entorno y gobierna transiciones nativas. Gentle Shell coordina workers; Pi ejecuta los agentes.',[
 n('Gentle AI','Configuración y contratos','BINARIO GO'),n('Gentle Shell','Padre responsable','PAQUETE GENTLE-PI'),n('Worker en Pi','Tarea y herramientas','CONTEXTO ACOTADO'),n('Padre','Integra evidencia','RESPONSABILIDAD')])
s('El sistema','ODD','Tres decisiones, tres capas','«No todas las tareas necesitan el mismo recorrido.»','ODD organiza el trabajo. TDD guía la implementación si está activo. RDD revisa candidatos según riesgo y modo efectivo.',[
 n('ODD','Alcance y continuidad','CÓMO TRABAJAR'),n('Implementación','TDD o controles ordinarios','CÓMO CONSTRUIR'),n('RDD','Candidato exacto y riesgo','CÓMO REVISAR'),n('Persona','Decide la entrega','PUBLICAR ES APARTE')])
s('01 · Cambio pequeño','ODD','Caso 1: corregir un texto','«Corrige “Exportar archibo” en la ayuda.»','La petición autoriza una corrección de texto. El agente confirma que es documentación pasiva y que entiende el cambio.',[
 n('Petición','Corregir una palabra','AUTORIZADO'),n('Explorar','Leer la ayuda existente','UN ARCHIVO'),n('Clasificar','Pequeño y comprendido','ODD LIGERO'),n('Ruta directa','Sin worker adicional','CONTEXTO SUFICIENTE')])
s('01 · Cambio pequeño','ODD','No se fabrica una fase innecesaria','«Solo cambia la palabra incorrecta.»','No crea un plan formal ni un documento persistente para esta tarea pequeña. La comprobación debe corresponder al cambio.',[
 n('Editar','archibo → archivo','CAMBIO ACOTADO'),n('TDD','Sin prueba de comportamiento','EXCEPCIÓN DOCUMENTAL'),n('Leer resultado','Texto y diff correctos','EVIDENCIA'),n('Cerrar tarea','Cambio explicado','SIN PRUEBAS FICTICIAS')])
s('01 · Cambio pequeño','RDD','Contenido pasivo: cero revisores','«¿Necesita cuatro agentes para revisar esto?»','Si los bytes y modos demuestran contenido pasivo, el clasificador usa lectura estructural. No basta la extensión del archivo.',[
 n('Candidato','Texto de ayuda','CAMBIO EXACTO'),n('Evaluar riesgo','Contenido pasivo','CLASIFICADOR NATIVO'),n('0 perspectivas','Lectura estructural','SIN CEREMONIA'),n('Resultado','Corrección comprobada','ENTREGA SEGÚN POLÍTICA')])
s('02 · Exportación CSV','ODD','Caso 2: una funcionalidad completa','«Añade exportación CSV respetando los filtros actuales.»','Se inspecciona el flujo real. El ejemplo necesita entender seis archivos y modificar tres: conviene delegar contexto y escritura.',[
 n('Petición','Exportar lo filtrado','ALCANCE'),n('Padre','Explora restricciones','ODD'),n('Mapper','Entiende seis archivos','EXPLORACIÓN DELEGADA'),n('Handoff','Rutas y riesgos relevantes','REGRESA AL PADRE')])
s('02 · Exportación CSV','ODD','Resolver una decisión real','«Usa los mismos permisos y filtros del reporte.»','El padre aclara el contrato que afecta al producto. Investigar no autoriza ampliar requisitos ni entrar automáticamente en SDD.',[
 n('Hallazgo','Exportar todo sería distinto','INCERTIDUMBRE'),n('Decisión','Respetar filtros y permisos','ALCANCE CONFIRMADO'),n('Tareas','Consulta, CSV y validación','TRABAJO SUSTANCIAL'),n('Método','Continúa en ODD','SDD SOLO SI SE ELIGE')])
s('02 · Exportación CSV','ODD','Guardar intención antes de editar código','«Quiero poder continuar mañana sin empezar de cero.»','Para trabajo sustancial se crea un documento ODD y su espejo completo en Engram. Las dos escrituras deben verificarse.',[
 n('Padre','Objetivo y restricciones','PLAN ACOTADO'),n('Documento ODD','Tareas y aceptación','odd/tasks/export-csv.md'),n('Engram','Copia completa y ruta','odd/export-csv/tasks'),n('Verificar guardado','Si falla, dejar pendiente','NO ES ATÓMICO')])
s('02 · Exportación CSV','ODD','Un escritor recibe un contrato preciso','«Implementa la primera unidad de comportamiento.»','El worker recibe alcance, documento, skills pertinentes, modo TDD y runner exacto. El padre conserva la responsabilidad final.',[
 n('Padre','Tarea y criterio de éxito','ORQUESTACIÓN'),n('Worker','Lee documento y código','UN ESCRITOR'),n('Configuración','TDD activo y su fuente','ELECCIÓN EXPLÍCITA'),n('Runner','dotnet test --filter Csv','COMANDO ILUSTRATIVO')])
s('02 · Exportación CSV','TDD','RED: demostrar qué falta','«El CSV debe contener únicamente los registros filtrados.»','Primero se escribe y ejecuta un test del comportamiento faltante. En el contrato ODD del worker, RED es un fallo observado.',[
 n('Criterio','Solo registros filtrados','CONTRATO'),n('Test nuevo','Dos registros; uno cumple','PREPARAR CASO'),n('Ejecutar','Falla por exportación ausente','RED OBSERVADO'),n('Avanzar','Ahora puede implementar','EVIDENCIA GUARDADA')])
s('02 · Exportación CSV','TDD','GREEN: la mínima implementación correcta','«Haz pasar ese comportamiento sin ampliar el alcance.»','El escritor implementa lo necesario y ejecuta el mismo test. Un mensaje de éxito sin ejecución no demuestra GREEN.',[
 n('Worker','Implementa exportación','CAMBIO ACOTADO'),n('Runner','Ejecuta el test focalizado','MISMO CONTRATO'),n('Resultado','Solo sale el registro válido','GREEN OBSERVADO'),n('Evidencia','Comando y resultado real','REGISTRO DE LA TAREA')])
s('02 · Exportación CSV','TDD','TRIANGULATE: salir del único ejemplo','«También debe funcionar con comas, comillas y cero filas.»','Se añaden casos que obligan a generalizar. Cada comportamiento faltante recorre prueba, fallo y corrección pertinente.',[
 n('Caso inicial','Una fila filtrada','YA PASA'),n('Caso alterno','Comas y comillas','ESCAPADO CSV'),n('Caso límite','Lista vacía','CONTRATO DEFINIDO'),n('Suite focalizada','Casos relevantes pasan','EVITAR GREEN TRIVIAL')])
s('02 · Exportación CSV','TDD','REFACTOR: mejorar sin cambiar el resultado','«Separa el formato CSV de la consulta.»','Se mejora el diseño y se repiten las pruebas. Si aparece una regresión, se revierte ese refactor y se intenta un paso menor.',[
 n('Pruebas verdes','Comportamiento protegido','BASE'),n('Refactor','Extraer formateador puro','CLARIDAD'),n('Volver a probar','Debe seguir pasando','CONDICIÓN DE AVANCE'),n('Si falla','Revertir último refactor','VOLVER A VERDE')])
s('02 · Exportación CSV','ODD','La tarea cierra con evidencia','«¿Qué quedó terminado y cómo lo sabes?»','El worker devuelve resultados observados. El padre comprueba, actualiza tareas y memoria y registra la unidad de trabajo.',[
 n('Worker','Diff y pruebas observadas','HANDOFF'),n('Padre','Comprobación puntual','RESPONSABLE'),n('Documento + memoria','Progreso y próximo paso','CONTINUIDAD'),n('Unidad de trabajo','Commit si autorizado','POLÍTICA DEL REPO')])
s('02 · Exportación CSV','RDD','Riesgo medio: acumular el tramo','«¿Revisa cada casilla marcada del plan?»','En este ejemplo, 180 líneas quedan bajo presupuesto; el tramo llega luego a 420. El binario devuelve cuándo corresponde revisar.',[
 n('Primer commit','180 líneas del tramo','MEDIUM · UNDER_BUDGET'),n('Siguiente unidad','420 líneas acumuladas','MISMO TRAMO'),n('review assess','review_due: true','SLICE_BUDGET_REACHED'),n('STATUS','Continuación exacta','NO ES UNA CASILLA TODO')])
s('02 · Exportación CSV','RDD','Congelar antes de revisar','«Revisa exactamente esta versión del CSV.»','Con el modo efectivo habilitado, se sigue la transición nativa y el consentimiento aplicable. START vincula y congela el candidato.',[
 n('STATUS','Operación y argumentos','AUTORIDAD NATIVA'),n('START','Versión inmutable','LINEAGE · TARGET'),n('Consentimiento','Concedido en este ejemplo','DECISIÓN DEL USUARIO'),n('1 perspectiva','Revisor focalizado','RIESGO MEDIO')])
s('02 · Exportación CSV','RDD','Cerrar sin convertir revisión en publicación','«La revisión terminó sin hallazgos pendientes.»','El resultado aprobado ofrece un ACK exacto. Ese ACK consume la autoridad de la revisión; no publica ni autoriza otros cambios.',[
 n('Revisor','Evidencia del candidato','ÁRBOLES CONGELADOS'),n('Resultado nativo','Aprobado en el ejemplo','INFORMATIVO'),n('ACK exacto','Consume la autoridad','NO REUTILIZABLE'),n('Entrega','PR o push si autorizado','DECISIÓN SEPARADA')])
s('03 · Permisos de acceso','ODD','Caso 3: pocas líneas, mucha consecuencia','«Impide que un usuario lea reportes de otra empresa.»','Un cambio pequeño en autorización puede ser de alto riesgo. El número de líneas no decide la profundidad de revisión.',[
 n('Petición','Aislar datos por empresa','SEGURIDAD'),n('Explorar','Identidad, tenant y consulta','ALCANCE SENSIBLE'),n('Decidir alcance','Bloquear acceso cruzado','CONTRATO'),n('Implementar en ODD','TDD configurado activo','SIN SDD AUTOMÁTICO')])
s('03 · Permisos de acceso','TDD','Pruebas de acceso permitido y denegado','«El usuario de A nunca debe leer el reporte de B.»','El test reproduce el acceso indebido antes del arreglo. Luego se conserva el acceso legítimo y se prueba identidad incompleta.',[
 n('RED','Acceso cruzado se permite','FALLO OBSERVADO'),n('GREEN','Validar empresa y permiso','BLOQUEAR EL CASO'),n('TRIANGULATE','Propio, ajeno y sin tenant','RUTAS DISTINTAS'),n('REFACTOR','Pruebas siguen verdes','EVIDENCIA')])
s('03 · Permisos de acceso','RDD','El binario detecta riesgo alto','«El diff tiene solo 18 líneas.»','La señal de autorización eleva el riesgo. Con RDD habilitado, review_due es verdadero sin esperar a 400 líneas.',[
 n('Candidato','Cambio de autorización','18 LÍNEAS ILUSTRATIVAS'),n('Clasificador','Señal sensible','RIESGO HIGH'),n('review_due','true: high_risk','SIN UMBRAL DE VOLUMEN'),n('START + permiso','Revisión autorizada','CANDIDATO CONGELADO')])
s('03 · Permisos de acceso','RDD','Cuatro perspectivas sobre la misma versión','«Busca riesgos desde ángulos diferentes.»','El plan de alto riesgo usa las cuatro perspectivas. Se representan concurrentes, no como cuatro aprobaciones en secuencia.',[
 n('Candidato congelado','Misma versión para todos','FUENTE ÚNICA'),n('Risk','Abuso y exposición','PERSPECTIVA 1'),n('Resilience','Fallas y recuperación','PERSPECTIVA 2'),n('Readability','Claridad del cambio','PERSPECTIVA 3'),n('Reliability','Corrección y consistencia','PERSPECTIVA 4')],edges=[['a','b','revisar'],['a','c','revisar'],['a','d','revisar'],['a','e','revisar']])
s('03 · Permisos de acceso','RDD','Un hallazgo necesita sustento','«El caché podría devolver datos de otra empresa.»','En el ejemplo se encuentra una clave de caché sin tenant. La refutación contrasta la afirmación antes de aceptar la corrección.',[
 n('Hallazgo','Clave sin empresa','POSIBLE FUGA'),n('Evidencia','Ruta y caso reproducible','SUSTENTO'),n('Refutación','Contrastar causalidad','DESCARTAR FALSOS POSITIVOS'),n('Resultado','Defecto sustentado','CORRECCIÓN ACOTADA')])
s('03 · Permisos de acceso','RDD','Una corrección, no un bucle interminable','«Añade el tenant a la clave sin rediseñar todo el caché.»','La transacción permite como máximo un lote acotado. Se respeta el presupuesto nativo y no se amplía el producto.',[
 n('Criterio original','Aislamiento por empresa','ALCANCE'),n('Una corrección','Incluir tenant en clave','LOTE LIMITADO'),n('Prueba focalizada','Dos empresas, mismo ID','COMPROBAR EL DEFECTO'),n('Nuevo candidato','Ligado a esta corrección','NO REUSAR EL ANTERIOR')])
s('03 · Permisos de acceso','RDD','Validar la corrección y sus regresiones','«¿El arreglo sigue permitiendo el acceso legítimo?»','El validador comprueba los criterios y las regresiones sobre el candidato correcto. Si no puede inspeccionarlo, no emite éxito.',[
 n('Validador dirigido','Árbol de la corrección','CONTEXTO INMUTABLE'),n('Criterios originales','Acceso cruzado bloqueado','EVIDENCIA'),n('Regresiones','Acceso propio funciona','EVIDENCIA'),n('Resultado nativo','Aprueba o escala','SIN ÉXITO INVENTADO')])
s('03 · Permisos de acceso','RDD','La revisión termina; la persona decide','«Prepara el resultado para que yo decida la entrega.»','Si aprueba, se ejecuta el ACK nativo. Si escala, se informa el bloqueo. Ningún estado hace push o release por sí mismo.',[
 n('Aprobado','ACK exacto','CIERRE'),n('Padre','Resume cambios y pruebas','RESULTADO'),n('Persona','Decide según política','AUTORIZACIÓN'),n('Entrega','Solo acción autorizada','PR · PUSH · RELEASE')])
s('04 · Reanudar y decidir','ODD','Caso 4: continuar una tarea interrumpida','«Continúa con la exportación de ayer.»','Antes de tocar código, el padre recupera el documento completo y su espejo. La memoria no sustituye comprobar el estado actual.',[
 n('Petición','Retomar exportación','NUEVA SESIÓN'),n('Documento ODD','Tareas y evidencias','ARCHIVO REAL'),n('Engram','Espejo y ruta','MEMORIA COMPLETA'),n('Código actual','Conciliar lo que cambió','VERIFICACIÓN')])
s('04 · Reanudar y decidir','ODD','Conservar trabajo válido y resolver divergencias','«La memoria está temporalmente desconectada.»','Se conserva el progreso local y se declara el espejo pendiente. No se inventa sincronización ni se pierde lo ya completado.',[
 n('Documento local','Progreso recuperable','FUENTE DISPONIBLE'),n('Engram sin conexión','Espejo pendiente','ESTADO EXPLÍCITO'),n('Conciliar evidencia','Preservar tareas válidas','NO REINICIAR TODO'),n('Próxima tarea','Dentro del alcance','CONTINUAR CON CRITERIO')])
s('04 · Reanudar y decidir','TDD','El modo se vuelve a resolver','«Esta tarea tiene TDD desactivado en la configuración.»','Al reanudar se refrescan modo, fuente y runner. TDD apagado conserva comprobaciones funcionales; no genera RED ficticio.',[
 n('Configuración','TDD desactivado','MODO CONOCIDO'),n('Worker','Implementa tarea acotada','ALCANCE'),n('Verificación','Pruebas funcionales pertinentes','EJECUCIÓN OBSERVADA'),n('Evidencia','Resultado, sin ciclo inventado','CONTROL CONSERVADO')])
s('04 · Reanudar y decidir','RDD','Declinar RDD no elimina la verificación','«No ejecutes esa revisión ahora.»','Declinar este candidato no cambia el modo global. El padre usa la ruta alternativa de verificación según riesgo.',[
 n('Consentimiento','Usuario declina','SOLO ESTE CANDIDATO'),n('RDD','No se ejecuta','SIN APROBACIÓN'),n('Evaluar riesgo','Determinar alternativa','OPERACIÓN DE LECTURA'),n('Comprobar','Mantener evidencia','SIN REBAJAR EL CONTROL')])
s('04 · Reanudar y decidir','RDD','La alternativa depende del riesgo','«¿Quién verifica si no hubo revisión nativa?»','Pasivo: lectura estructural. Medio: evidencia del escritor, más verificador si usa modelo pequeño. Alto o desconocido: verificador adicional.',[
 n('Riesgo nativo','No depende de la opinión','ASSESS'),n('Pasivo','Lectura del padre','SIN TESTS ARTIFICIALES'),n('Medio','Escritor; extra si mini','MODELO O ESFUERZO'),n('Alto / desconocido','Escritor + verificador','COMPROBACIÓN INDEPENDIENTE')],edges=[['a','b','pasivo'],['a','c','medio'],['a','d','alto']])
s('04 · Reanudar y decidir','ODD','Finalizar con la verdad del trabajo','«Dime qué está listo y qué falta.»','El padre integra evidencia, actualiza documento y espejo disponible, y declara la revisión no realizada y los pendientes reales.',[
 n('Worker','Resultados observados','HANDOFF'),n('Padre','Comprobación puntual','RESPONSABLE'),n('Documento + memoria','Estado y pendientes','CONTINUIDAD'),n('Persona','Recibe resultado honesto','SIGUIENTE DECISIÓN')])
s('El flujo completo','ODD','La complejidad cambia el esfuerzo','«¿Cuándo hace falta algo más formal?»','Leer más contexto puede exigir delegación. El riesgo aumenta comprobaciones. SDD se elige explícitamente, no por tamaño.',[
 n('Más contexto','Exploración delegada','4+ ARCHIVOS'),n('Más escritura','Un escritor acotado','2+ NO TRIVIALES'),n('Más riesgo','Revisión más profunda','0 · 1 · 4'),n('SDD explícito','Artefactos formales','ELECCIÓN DEL USUARIO')])
s('El flujo completo','RDD','De intención a evidencia, sin perder el control','«Entender, construir, comprobar y decidir.»','ODD conserva el hilo. TDD demuestra comportamientos cuando está activo. RDD revisa el candidato exacto. La entrega sigue bajo autorización.',[
 n('ODD','Alcance y memoria','CONTINUIDAD'),n('TDD si activo','Comportamiento probado','CONSTRUCCIÓN'),n('RDD si corresponde','Evidencia independiente','REVISIÓN'),n('Persona','Control sobre la entrega','RESULTADO')],dur=10)
# Diagram layout: regular pipeline; concurrent layouts for fan-outs.
COL={'ODD':'#f095c8','TDD':'#68dec4','RDD':'#b8a5ff'}
def layout(sc):
 if len(sc['edges'])>1 and all(e[0]=='a' for e in sc['edges']):
  slots={'a':(62,412),'b':(500,280),'c':(1090,280),'d':(500,510),'e':(1090,510)}
 else: slots={'a':(62,372),'b':(452,372),'c':(842,372),'d':(1232,372),'e':(452,550),'f':(842,550)}
 return slots
W,H=1600,900;NW,NH=306,154
esc=lambda t:html.escape(str(t),quote=True)
def text(x,y,txt,size=24,fill='#f9f0f7',weight=400,anchor='start'):
 return f'<text x="{x}" y="{y}" font-family="DejaVu Sans, sans-serif" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{esc(txt)}</text>'
def lines(x,y,txt,size,width=55,fill='#e0ccda',gap=None):
 return ''.join(text(x,y+i*(gap or size*1.4),line,size,fill) for i,line in enumerate(textwrap.wrap(txt,width)))
def path(sc,a,b):
 p=layout(sc);x,y=p[a];u,v=p[b]
 if y==v:return [(x+NW,y+NH/2),(u,y+NH/2)]
 if a=='a' and all(e[0]=='a' for e in sc['edges']):
  # Dedicated outside corridors for parallel roles; avoid all cards.
  if b in ['b','d']:return [(x+NW,y+NH/2),(415,y+NH/2),(415,v+NH/2),(u,v+NH/2)]
  channel=248 if b=='c' else 695
  return [(x+NW/2,y if b=='c' else y+NH),(x+NW/2,channel),(u+NW/2,channel),(u+NW/2,v if b=='c' else v+NH)]
 return [(x+NW/2,y+NH),(x+NW/2,v-30),(u+NW/2,v-30),(u+NW/2,v)]
def plen(pts):return sum(math.dist(a,b) for a,b in zip(pts,pts[1:]))
def motion(pathpoints,t):
 lens=[math.dist(a,b) for a,b in zip(pathpoints,pathpoints[1:])];dist=t*sum(lens)
 for a,b,L in zip(pathpoints,pathpoints[1:],lens):
  if dist<=L:return [a[0]+(b[0]-a[0])*dist/L,a[1]+(b[1]-a[1])*dist/L]
  dist-=L
 return pathpoints[-1]
def render(sc,idx,visible=99,smil=False):
 color=COL[sc['phase']]; p=layout(sc);parts=[]
 parts.append('<rect width="1600" height="900" fill="#140f19"/>')
 parts.append('<rect x="0" y="0" width="1600" height="900" fill="url(#ambient)"/>')
 parts.append(text(62,49,'GENTLE  /  DEL PEDIDO A LA EVIDENCIA',17,'#bb9db4',600))
 parts.append(text(1538,49,f"{idx+1:02d} / {len(SC):02d}   ·   SIMULACIÓN",15,'#bb9db4',400,'end'))
 for i,ph in enumerate(['ODD','TDD','RDD']):
  x=62+i*170;parts.append(f'<rect x="{x}" y="76" width="146" height="34" rx="17" fill="{COL[ph] if ph==sc["phase"] else "#302334"}"/>');parts.append(text(x+73,100,ph,17,'#160e1b' if ph==sc['phase'] else '#b7a0af',600,'middle'))
 parts.append(text(62,159,sc['ch'].upper(),18,color,600))
 parts.append(text(62,208,sc['title'],36,'#fff5fc',600))
 # Request stays just above the flow; branch layouts reserve room.
 if not all(e[0]=='a' for e in sc['edges']):
  parts.append(f'<rect x="62" y="256" width="1476" height="65" rx="16" fill="#281d2e"/>')
  parts.append(text(87,297,sc['request'],24,'#e2ccdd'))
 else:parts.append(text(62,744,sc['request'],21,'#e2ccdd'))
 for j,(a,b,label) in enumerate(sc['edges']):
  pts=path(sc,a,b);d='M'+' L'.join(f'{x},{y}' for x,y in pts);delay=.5+j*.62
  op=1 if visible>=j+1 else .12
  parts.append(f'<g opacity="{op}"><path d="{d}" fill="none" stroke="#664966" stroke-width="2" marker-end="url(#arrow)"/>')
  if smil:
   parts.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="3" stroke-dasharray="{plen(pts)}" stroke-dashoffset="{plen(pts)}"><animate attributeName="stroke-dashoffset" from="{plen(pts)}" to="0" begin="{sc["start"]+delay}s" dur="0.75s" fill="freeze"/></path>')
   parts.append(f'<circle r="5" fill="{color}" opacity="0"><set attributeName="opacity" to="1" begin="{sc["start"]+delay+.6}s" dur="{sc["dur"]-delay-.6}s"/><animateMotion path="{d}" begin="{sc["start"]+delay+.6}s" dur="2s" repeatCount="indefinite"/></circle>')
  parts.append('</g>')
 for j,node in enumerate(sc['nodes']):
  key=chr(97+j);x,y=p[key];label,body,tag=node;delay=j*.65
  op=1 if j<visible else .14
  parts.append(f'<g opacity="{0 if smil else op}">')
  if smil:parts.append(f'<animate attributeName="opacity" from="0" to="1" begin="{sc["start"]+delay}s" dur="0.45s" fill="freeze"/>')
  parts.append(f'<rect x="{x}" y="{y}" width="{NW}" height="{NH}" rx="18" fill="#291e30" stroke="#795478" stroke-width="1.4"/>')
  parts.append(f'<rect x="{x+20}" y="{y+22}" width="5" height="24" rx="2" fill="{color}"/>')
  parts.append(text(x+39,y+43,label,22,'#fff6fb',600))
  parts.append(lines(x+22,y+80,body,20,24,'#d1b9cd',26))
  parts.append(text(x+22,y+131,tag,12.5,color,600));parts.append('</g>')
 if not all(e[0]=='a' for e in sc['edges']):
  # An explicit mechanism is the only extra line in the flow area.
  parts.append(text(800,628,{'ODD':'ALCANCE → CONTEXTO → ACCIÓN → EVIDENCIA','TDD':'PRUEBA → IMPLEMENTACIÓN → CASOS → REFACTOR','RDD':'CANDIDATO → RIESGO → REVISIÓN → RESULTADO'}[sc['phase']],20,color,500,'middle'))
 parts.append('<path d="M62 774H1538" stroke="#473247"/>')
 parts.append(lines(62,816,sc['caption'],23,112,'#f0deec',32))
 return ''.join(parts)
DEFS='<defs><radialGradient id="ambient" cx="15%" cy="0%" r="100%"><stop stop-color="#613047" stop-opacity=".3"/><stop offset="1" stop-color="#140f19" stop-opacity="0"/></radialGradient><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10" fill="#886482"/></marker></defs>'
start=0
for i,sc in enumerate(SC):
 sc['start']=start;start+=sc['dur']
 for k in range(1,len(sc['nodes'])+1):
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">{DEFS}{render(sc,i,k)}</svg>'
  (ROOT/'escenas'/f'{i:02d}-{k}.svg').write_text(svg)
scenesvg=[]
for i,sc in enumerate(SC):
 scenesvg.append(f'<g visibility="hidden"><set attributeName="visibility" to="visible" begin="{sc["start"]}s" dur="{sc["dur"]}s"/>{render(sc,i,smil=True)}</g>')
svg=f'<svg xmlns="http://www.w3.org/2000/svg" id="film" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc"><title id="title">ODD, TDD y RDD: del pedido a la evidencia</title><desc id="desc">Animación didáctica de cuatro casos. Resultados simulados basados en diagramas y documentación oficiales.</desc>{DEFS}'+''.join(scenesvg)+f'<g visibility="hidden"><set attributeName="visibility" to="visible" begin="{start}s"/>{render(SC[-1],len(SC)-1)}</g></svg>'
(ROOT/'Gentle_Flujo_Animado.svg').write_text(svg)
(ROOT/'fuentes'/'guion.json').write_text(json.dumps(SC,ensure_ascii=False,indent=2))
# Standalone player, keeps all vectors inline and works offline.
chapters=[]
for i,sc in enumerate(SC):
 if i==0 or sc['ch']!=SC[i-1]['ch']:chapters.append([sc['start'],sc['ch']])
css='''*{box-sizing:border-box}body{margin:0;background:#110c16;color:#f9edf6;font-family:system-ui,sans-serif}main{max-width:1600px;margin:auto}#screen{line-height:0}svg{width:100%;height:auto;display:block}nav{display:flex;gap:10px;align-items:center;padding:16px 22px;flex-wrap:wrap}button,select{font:inherit;border:1px solid #735170;border-radius:10px;padding:10px 15px;background:#2a1d30;color:inherit;cursor:pointer}button:hover{background:#47304b}input[type=range]{accent-color:#f095c8;flex:1;min-width:140px}#clock{font-variant-numeric:tabular-nums}details{padding:15px 24px;color:#ceb5c8;font-size:14px}a{color:#efafd7}#sceneText{padding:0 24px 12px;color:#ceb5c8;margin:0}summary{cursor:pointer}@media(max-width:600px){nav{padding:10px;gap:6px}button,select{padding:9px;font-size:13px}}'''
controls='<button id="play">Reproducir</button><button id="prev" aria-label="Escena anterior">←</button><button id="next" aria-label="Escena siguiente">→</button><input id="seek" type="range" min="0" max="'+str(start)+'" step="0.05" value="0" aria-label="Posición del video"><span id="clock"></span><select id="speed" aria-label="Velocidad"><option value="0.75">0,75×</option><option selected value="1">1×</option><option value="1.5">1,5×</option><option value="2">2×</option></select><button id="full">Pantalla completa</button>'
chapterhtml=''.join(f'<button data-time="{t}">{esc(name)}</button>' for t,name in chapters)
script='''const film=document.getElementById('film'),play=document.getElementById('play'),seek=document.getElementById('seek'),clock=document.getElementById('clock'),speed=document.getElementById('speed');const scenes=SCENES,total=TOTAL;let time=0,running=false,last=0;film.pauseAnimations();film.setCurrentTime(0.1);function fmt(t){return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')}function index(){let i=scenes.findIndex(s=>time<s.start+s.dur);return i<0?scenes.length-1:i}function paint(){film.setCurrentTime(Math.min(time,total));seek.value=time;clock.textContent=fmt(time)+' / '+fmt(total);document.getElementById('sceneText').textContent=scenes[index()].caption;play.textContent=running?'Pausar':'Reproducir'}function go(t){time=Math.max(0,Math.min(total,t));paint()}play.onclick=()=>{if(time>=total)time=0;running=!running;paint()};seek.oninput=()=>go(+seek.value);document.getElementById('prev').onclick=()=>go(scenes[Math.max(0,index()-1)].start);document.getElementById('next').onclick=()=>go(scenes[Math.min(scenes.length-1,index()+1)].start);document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>go(+b.dataset.time));document.getElementById('full').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.querySelector('main').requestFullscreen?.()};document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;if(e.code==='Space'){e.preventDefault();play.click()}if(e.code==='ArrowRight')go(time+8);if(e.code==='ArrowLeft')go(time-8)});document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;paint()}});function tick(now){let dt=last?Math.min((now-last)/1000,.12):0;last=now;if(running){time=Math.min(total,time+dt*+speed.value);if(time>=total)running=false;paint()}requestAnimationFrame(tick)}paint();requestAnimationFrame(tick);'''.replace('SCENES',json.dumps(SC,ensure_ascii=False)).replace('TOTAL',str(start))
(ROOT/'fuentes'/'reproductor.js').write_text(script)
ai='https://github.com/Gentleman-Programming/gentle-ai/blob/f0782af2803a8192477c18d2186795e9c9daa6c3/'
sh='https://github.com/Gentleman-Programming/gentle-shell/blob/54548321be8c8d60891e89ea13bf2b0ed10e1ac5/'
sources=[('Diagrama oficial ODD',ai+'docs/assets/diagrams/odd-cycle.svg'),('Diagrama oficial RDD',ai+'docs/assets/diagrams/rdd-review.svg'),('Orquestación oficial',sh+'docs/assets/diagrams/agent-orchestration.svg'),('Protocolo ODD',ai+'docs/usage.md'),('Worker y TDD',sh+'assets/agents/gentle-ai-worker.md'),('Contrato RDD',ai+'docs/review-integration.md'),('Verificación alternativa',sh+'docs/delegated-verification.md')]
sourcehtml='<details><summary>Fuentes y alcance de la simulación</summary><p>Basado en los commits revisados, no en una ejecución real de Pi. Los ejemplos suponen el modo RDD habilitado donde se indica; se consulta siempre el modo efectivo. TDD sigue el contrato ODD del worker: RED observado. Existen textos antiguos contradictorios; esta animación no los presenta como una regla uniforme. SDD no se activa por complejidad y no lanza RDD automáticamente.</p><ul>'+''.join(f'<li><a href="{u}" target="_blank" rel="noopener">{l}</a></li>' for l,u in sources)+'</ul></details>'
(ROOT/'Gentle_Flujo_Animado.html').write_text('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gentle · Flujo animado</title><style>'+css+'</style><main><div id="screen">'+svg+'</div><nav>'+controls+'</nav><nav aria-label="Capítulos">'+chapterhtml+'</nav><p id="sceneText" aria-live="off"></p>'+sourcehtml+'</main><script>'+script+'</script></html>')
(ROOT/'fuentes'/'fuentes.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2))
print(len(SC),'escenas;',start,'segundos')

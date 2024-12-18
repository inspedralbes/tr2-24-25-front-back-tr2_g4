import sys
import json
import matplotlib.pyplot as plt
import numpy as np

def generar_grafico_tipo(nombre_alumno, tipo_problema, datos):
    """
    Genera un gráfico de barras con las estadísticas de un tipo de problema específico.

    Args:
        nombre_alumno (str): Nombre del alumno.
        tipo_problema (str): Tipo de problema ('suma', 'resta', 'multiplicacion', 'division').
        datos (dict): Diccionario con las dificultades y los resultados filtrados por tipo de problema.
                      Formato: {1: {'correctas': int, 'incorrectas': int}, ...}
    """
    dificultades = sorted(datos.keys())  # Asegurarse de ordenar por dificultad
    correctas = [datos[d]['correctas'] for d in dificultades]
    incorrectas = [datos[d]['incorrectas'] for d in dificultades]

    # Configurar el gráfico de barras
    x = np.arange(len(dificultades))  # Posiciones de las dificultades
    ancho = 0.35  # Ancho de las barras

    fig, ax = plt.subplots()
    barras_correctas = ax.bar(x - ancho/2, correctas, ancho, label='Correctas', color='green')
    barras_incorrectas = ax.bar(x + ancho/2, incorrectas, ancho, label='Incorrectas', color='red')

    # Añadir etiquetas y título
    ax.set_xlabel('Dificultad')
    ax.set_ylabel('Cantidad de respuestas')
    ax.set_title(f'Resultados de {nombre_alumno} - Tipo: {tipo_problema.capitalize()}')
    ax.set_xticks(x)
    ax.set_xticklabels(dificultades)
    ax.legend()

    # Añadir valores encima de las barras
    def agregar_valores(barras):
        for barra in barras:
            altura = barra.get_height()
            ax.annotate(f'{altura}',
                        xy=(barra.get_x() + barra.get_width() / 2, altura),
                        xytext=(0, 3),  # Desplazamiento vertical
                        textcoords="offset points",
                        ha='center', va='bottom')

    agregar_valores(barras_correctas)
    agregar_valores(barras_incorrectas)

    # Guardar gráfico como archivo PNG
    ruta_salida = f"../node/public/{nombre_alumno}-{tipo_problema}-graph.png"
    plt.tight_layout()
    plt.savefig(ruta_salida)
    print(f"Gráfico de tipo {tipo_problema} guardado en {ruta_salida}")

if __name__ == "__main__":
    try:
        # Leer los argumentos del script
        if len(sys.argv) < 4:
            print("Error: Faltan argumentos. El script espera tres argumentos: nombre_alumno, tipo_problema y resultados_json.")
            sys.exit(1)

        nombre_alumno = sys.argv[1]
        tipo_problema = sys.argv[2]
        resultados_json = sys.argv[3]

        # Convertir los resultados a un diccionario
        try:
            resultados = json.loads(resultados_json)
        except json.JSONDecodeError:
            print(f"Error al decodificar el JSON: {resultados_json}")
            sys.exit(1)

        if not isinstance(resultados, list):
            print("Error: Los resultados deben ser una lista de objetos.")
            sys.exit(1)

        # Procesar los resultados para el gráfico de tipo específico
        datos = {}
        for resultado in resultados:
            # Filtrar por tipo de problema
            if resultado['tipoPregunta'] != tipo_problema:
                continue

            # Validar que los datos tengan la estructura correcta
            if 'dificultad' not in resultado or 'esCorrecto' not in resultado:
                print(f"Error: El objeto de resultado está mal formado: {resultado}")
                sys.exit(1)

            dificultad = resultado['dificultad']
            es_correcto = resultado['esCorrecto']

            if dificultad not in range(1, 6):  # Filtrar dificultades no válidas
                continue

            if dificultad not in datos:
                datos[dificultad] = {'correctas': 0, 'incorrectas': 0}

            if es_correcto:
                datos[dificultad]['correctas'] += 1
            else:
                datos[dificultad]['incorrectas'] += 1

        # Generar el gráfico
        generar_grafico_tipo(nombre_alumno, tipo_problema, datos)

    except Exception as e:
        print(f"Error en el script Python: {e}", file=sys.stderr)
        sys.exit(1)

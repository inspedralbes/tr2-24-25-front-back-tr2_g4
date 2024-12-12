import sys
import json
import matplotlib.pyplot as plt
import numpy as np

def generar_grafico(nombre_alumno, datos):
    """
    Genera un gráfico de barras para mostrar los resultados de un alumno.

    Args:
        nombre_alumno (str): Nombre del alumno.
        datos (dict): Diccionario con las dificultades y los resultados.
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
    ax.set_title(f'Resultados de {nombre_alumno}')
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
    ruta_salida = f"static/{nombre_alumno}-graph.png"
    plt.tight_layout()
    plt.savefig(ruta_salida)
    print(f"Gráfico guardado en {ruta_salida}")


if __name__ == "__main__":
    # Leer los argumentos del script
    try:
        nombre_alumno = sys.argv[1]
        resultados_json = sys.argv[2]

        # Convertir los resultados a un diccionario
        resultados = json.loads(resultados_json)

        # Procesar los resultados para el gráfico
        datos = {}
        for resultado in resultados:
            dificultad = resultado['dificultad']
            es_correcto = resultado['esCorrecto']

            if dificultad not in range(1, 5):  # Filtrar dificultades no válidas
                continue

            if dificultad not in datos:
                datos[dificultad] = {'correctas': 0, 'incorrectas': 0}

            if es_correcto:
                datos[dificultad]['correctas'] += 1
            else:
                datos[dificultad]['incorrectas'] += 1

        # Generar el gráfico
        generar_grafico(nombre_alumno, datos)

    except Exception as e:
        print(f"Error en el script Python: {e}", file=sys.stderr)
        sys.exit(1)

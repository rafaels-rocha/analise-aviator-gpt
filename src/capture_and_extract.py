import sys
from PIL import Image
import pytesseract
import numpy as np
import cv2

def capture_and_extract(x, y, width, height):
    # Lê a imagem capturada pela Puppeteer
    full_image = cv2.imread('screenshot.png')  # Assumindo que a captura foi salva como 'screenshot.png'
    
    # Recorta a imagem
    cropped_image = full_image[y:y + height, x:x + width]
    
    # Salva a imagem recortada
    cv2.imwrite('cropped_image.png', cropped_image)  # Salva o recorte como 'cropped_image.png'

    # Usar pytesseract para extrair texto da imagem recortada
    text = pytesseract.image_to_string(cropped_image)
    text = text.replace("x", "").strip()  # Remove 'x' e espaços em branco desnecessários

    print(text)

if __name__ == '__main__':
    # Verifica se os argumentos necessários foram passados
    if len(sys.argv) != 5:
        print("Uso: python capture_and_extract.py <x> <y> <width> <height>")
        sys.exit(1)

    x = int(sys.argv[1])
    y = int(sys.argv[2])
    width = int(sys.argv[3])
    height = int(sys.argv[4])

    capture_and_extract(x, y, width, height)

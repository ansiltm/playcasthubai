from PIL import Image

def get_dominant_colors(image_path):
    img = Image.open(image_path)
    img = img.convert('RGB')
    img = img.resize((50, 50)) # reduce size for faster processing
    
    colors = img.getcolors(2500)
    colors.sort(reverse=True)
    
    print("Top 5 colors:")
    for count, color in colors[:5]:
        print(f"RGB: {color}, Hex: #{color[0]:02x}{color[1]:02x}{color[2]:02x}")

get_dominant_colors('frontend/public/logo.jpeg')

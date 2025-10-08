package com.kq.fleet_and_cargo.utils;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

public class ImageUtils {

    public static final int BITE_SIZE = 4 * 1024;

    public static byte[] compressImage(byte[] data) throws IOException {
        Deflater deflater = new Deflater();
        deflater.setLevel(Deflater.BEST_COMPRESSION);
        deflater.setInput(data);
        deflater.finish();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] tmp = new byte[BITE_SIZE];

        while(!deflater.finished()) {
            int size = deflater.deflate(tmp);
            outputStream.write(tmp,0, size);
        }

        outputStream.close();

        return outputStream.toByteArray();
    }

    public static byte[] decompressImage(byte[] data)  {
        Inflater inflater = new Inflater();
        inflater.setInput(data);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] tmp = new byte[BITE_SIZE];
        try {

            while (!inflater.finished()) {
                int count = inflater.inflate(tmp);
                outputStream.write(tmp, 0, count);
            }

            outputStream.close();
        }
        catch (DataFormatException | IOException e) {
            throw new RuntimeException("Failed to decompress image", e);
        }
        return outputStream.toByteArray();
    }

    public static byte[] generateImagePreview(byte[] data, int width, int height) throws IOException, DataFormatException {
        // Decompress the image if needed
        byte[] decompressedData = decompressImage(data);

        // Detect the image format
        String formatName = null;
        try (ImageInputStream iis = ImageIO.createImageInputStream(new ByteArrayInputStream(decompressedData))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
            if (readers.hasNext()) {
                ImageReader reader = readers.next();
                formatName = reader.getFormatName();
            }
        }

        // Convert to BufferedImage
        ByteArrayInputStream bais = new ByteArrayInputStream(decompressedData);
        BufferedImage originalImage = ImageIO.read(bais);

        // Create a resized version of the image
        Image scaledImage = originalImage.getScaledInstance(width, height, Image.SCALE_SMOOTH);
        BufferedImage resizedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resizedImage.createGraphics();
        g2d.drawImage(scaledImage, 0, 0, null);
        g2d.dispose();

        // Convert resized image to byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        if (formatName != null) {
            ImageIO.write(resizedImage, formatName, baos);
        } else {
            // Default to JPEG if format is unknown
            ImageIO.write(resizedImage, "jpg", baos);
        }
        baos.flush();
        byte[] previewData = baos.toByteArray();
        baos.close();

        return previewData;
    }
}

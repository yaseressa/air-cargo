package com.kq.fleet_and_cargo.utils;


public class CRC16Util {

    public static short calculateCrc16(byte[] data) {
        int crc = 0x0000; // Initial value
        int polynomial = 0x1021; // CRC-16-CCITT polynomial

        for (byte b : data) {
            for (int i = 0; i < 8; i++) {
                boolean bit = ((b >> (7 - i) & 1) == 1);
                boolean c15 = ((crc >> 15 & 1) == 1);
                crc <<= 1;
                if (c15 ^ bit) crc ^= polynomial;
            }
        }

        crc &= 0xffff;
        return (short) crc;
    }
}

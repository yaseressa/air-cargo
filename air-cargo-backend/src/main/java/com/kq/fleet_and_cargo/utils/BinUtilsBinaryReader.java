package com.kq.fleet_and_cargo.utils;

import lombok.extern.slf4j.Slf4j;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

@Slf4j
public class BinUtilsBinaryReader {
    public ByteBuffer buffer;

    public BinUtilsBinaryReader(byte[] data) {
        this.buffer = ByteBuffer.wrap(data).order(ByteOrder.BIG_ENDIAN); // Assuming big-endian as in JS 'binutils64' might imply
    }

    public ByteBuffer ReadBytes(int length) {
        if (buffer.remaining() < length) {
            throw new IllegalStateException("Not enough bytes in the buffer");
        }
        ByteBuffer bytes = ByteBuffer.allocate(length);
        for (int i = 0; i < length; i++) {
            bytes.put(buffer.get());
        }
        bytes.rewind();
        return bytes;
    }

    public int ReadInt32() {
        return buffer.getInt();
    }

    public short ReadInt16() {
        return buffer.getShort();
    }

    public byte ReadInt8() {
        return buffer.get();
    }

    public long getLong() {
        return buffer.getLong();
    }

    public short getShort() {
        return buffer.getShort();
    }

    public double getDouble() {
        return buffer.getDouble();
    }
}
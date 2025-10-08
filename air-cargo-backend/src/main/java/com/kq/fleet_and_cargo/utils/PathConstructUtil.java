package com.kq.fleet_and_cargo.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service

public class PathConstructUtil {
    @Value("${server.port}")
    private String serverPort;

    public List<String> fileLinksGen(List<String> paths){
        List<String> links = new ArrayList<>();
        for (String path : paths) {
            links.add("http://0.0.0.0:"+serverPort+"/api/files/"+path);
        }
        return links;
    }

}

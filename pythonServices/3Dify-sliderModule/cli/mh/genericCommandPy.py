#!/usr/bin/python

import os
import sys
from cli.mh.mhrc.JsonCall import JsonCall
from dotenv import load_dotenv 

def sendCommand(command):
    jsc = JsonCall()
    jsc.setFunction(command)

    load_dotenv() 
    ip = os.environ["MAKEHUMAN_IP"]
    port = os.environ["MAKEHUMAN_PORT"]

    print("ip " + ip)

    if ip is None:
        ip = "172.16.15.156"
    if port is None:
        port = "12345"

    response = jsc.send(ip, int(port))
    if not response:
        print("Command failed (returned null response)\n")
        sys.exit(1)
    if hasattr(response, "error") and getattr(response, "error"):
        print("ERROR: " + getattr(response, "error"))
        sys.exit(1)
    return response.getData()
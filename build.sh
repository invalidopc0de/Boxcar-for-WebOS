#!/bin/sh
palm-package -o ./build .
palm-install  build/com.invalidopcode.boxcar_1.0.0_all.ipk
palm-launch -i com.invalidopcode.boxcar

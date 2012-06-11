#!/bin/sh

# build with service
#palm-package -o ./build app service package
# or not
palm-package -o ./build app package
palm-install  build/com.invalidopcode.boxcar_1.0.0_all.ipk
palm-launch -i com.invalidopcode.boxcar

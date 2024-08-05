#!/bin/bash


APP_NAME="bailian-support"

function build_apps() {
    local cd_dir
    cd_dir=$(pwd)
    echo "Prepare to copy apps, current dir: $cd_dir"

    cd frontend
    npm install
    npm run build

    cd "$cd_dir"
    local build_path
    build_path="build/${APP_NAME}"
    build_target="build/${APP_NAME}/target/${APP_NAME}"
    mkdir -p "${build_path}" "${build_target}"

    cp -rf app ${build_target}
    cp -f ./*.py ${build_target}
    cp -f ./*.md ${build_target}

    mkdir -p ${build_target}/frontend
    cp -rf frontend/build ${build_target}/frontend/build

	  cd build/
	  tar zcvf ${APP_NAME}.tar.gz ${APP_NAME}
}

echo "######## Start building apps ############"
build_apps
#!/bin/bash
cd /home/kavia/workspace/code-generation/noteease-33828-fb23db68/noteease_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


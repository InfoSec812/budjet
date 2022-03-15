#!/bin/bash

while true;
do
    asciidoctor-pdf Lab_Instructions.adoc
    watch -g 'ls -l --full-time Lab_Instructions.adoc'
done

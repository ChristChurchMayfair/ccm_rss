#!/bin/bash

# Fetch XML from live lambda (AWS)
curl https://dgxo3owxgefai.cloudfront.net/ -o aws.sermons.xml
curl https://dgxo3owxgefai.cloudfront.net/londonliving -o aws.londonliving.xml

# Generate the new RSS files
(cd .. && yarn build_and_generate)

diff aws.sermons.xml ../public/sermons.xml
diff aws.londonliving.xml ../public/londonliving.xml


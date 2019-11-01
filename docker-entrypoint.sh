#!/bin/sh

echo 'Waiting for dl-database-api to come up...'
/wait

yarn serve
echo 'Finished'

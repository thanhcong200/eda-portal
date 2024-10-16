docker build -t eda-webportal-be .
docker tag eda-webportal-be:latest 891377012613.dkr.ecr.ap-southeast-1.amazonaws.com/eda-webportal:be-20240926
# docker push 891377012613.dkr.ecr.ap-southeast-1.amazonaws.com/eda-webportal:be-20240926
docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
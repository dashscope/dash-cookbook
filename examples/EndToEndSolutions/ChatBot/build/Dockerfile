FROM openjdk:8

COPY chat.jar /root
WORKDIR /root

ENTRYPOINT ["java", "-jar", "-Dspring.config.location=/root/", "/root/chat.jar"]

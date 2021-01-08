FROM openjdk

WORKDIR /codemaat
COPY ./code-maat-1.0.1-standalone.jar ./codemaat-standalone.jar

ENTRYPOINT ["java", "-Djava.awt.headless=true", "-jar", "codemaat-standalone.jar"]

CMD ["-h"]

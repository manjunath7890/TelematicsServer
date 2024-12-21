const mqtt = require('mqtt');

const mqttBrokerUrl = 'mqtt://broker.emqx.io';

const mqttUsername = 'emqx'; 
const mqttPassword = 'public'; 

const mqttOptions = {
  clientId: 'aspll_mqtt_client', 
  clean: true, 
  connectTimeout: 4000, 
  reconnectPeriod: 1000, 
  username: mqttUsername, 
  password: mqttPassword, 
  port: 1883
};

const client = mqtt.connect(mqttBrokerUrl, mqttOptions);

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  const topics = ['vehicle_vcu_data', 'vehicle_vcu_switch_request'];

  topics.forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Subscribed to ${topic}`);
      } else {
        console.error(`Subscription error for topic ${topic}:`, err);
      }
    });
  });

});

module.exports = client;
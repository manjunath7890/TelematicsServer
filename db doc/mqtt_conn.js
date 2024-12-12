const mqtt = require('mqtt');

// MQTT broker URL
const mqttBrokerUrl = 'mqtt://broker.emqx.io';

// MQTT authentication credentials
const mqttUsername = 'emqx'; // Replace with your MQTT username
const mqttPassword = 'public'; // Replace with your MQTT password

// Options for MQTT connection
const mqttOptions = {
  clientId: 'aspl_mqtt_client', // Unique client ID
  clean: true, // Keep session clean
  connectTimeout: 4000, // Time before connection times out
  reconnectPeriod: 1000, // Reconnect period
  username: mqttUsername, // MQTT username
  password: mqttPassword, // MQTT password
  port: 1883
};



// Connect to the MQTT broker
const client = mqtt.connect(mqttBrokerUrl, mqttOptions);

// MQTT connection events
client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Subscribe to the topics
  const topics = ['vehicle_vcu_data', 'vehicle_vcu_switch_request', 'test_topic'];

  topics.forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Subscribed to ${topic}`);
      } else {
        console.error(`Subscription error for topic ${topic}:`, err);
      }
    });
  });

  // const topic = 'test/topic';

  //   setInterval(() => {
  //     const message = JSON.stringify({
  //       sensor: 'temperature',
  //       value: (Math.random() * 10 + 20).toFixed(2), // Simulated data
  //       timestamp: new Date().toISOString(),
  //     });
  
  //     client.publish(topic, message, { qos: 0, retain: false }, (err) => {
  //       if (err) {
  //         console.error('Publish error:', err);
  //       } else {
  //         console.log('Message published:', message);
  //       }
  //     });
  //   }, 2000);
});

module.exports = client;
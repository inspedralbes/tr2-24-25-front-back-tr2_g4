<template>
    
      <v-card>
        <v-card-title class="text-video">🎥 Tutorial del Juego</v-card-title>
        <v-card-text>
          <iframe 
            width="100%" 
            height="400" 
            src="https://www.youtube.com/embed/ZldSOzmye4Q" 
            frameborder="0" 
            allowfullscreen
          ></iframe>
        </v-card-text>
        <v-card-actions>
          <v-btn color="white" text @click="showVideo = false">Cerrar ❌</v-btn>
        </v-card-actions>
      </v-card>
    
  </template>
  
  <script>
  export default {
    name: 'VideoTutorialDialog',
    props: {
      showVideo: {
        type: Boolean,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .text-video {
    background-color: #0288d1;
  }
  </style>
  
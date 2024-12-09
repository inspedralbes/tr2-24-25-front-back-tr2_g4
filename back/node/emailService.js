const axios = require('axios');



async function enviarCodigoAlCorreo(correoUsuario, codigo) {
    const payload = {
        service_id: 'service_xw9ryw5', 
        template_id: 'template_3i3jrdg', 
        user_id: 'J-gLAvGvroJYft-OY',
        template_params: {
            to_email: correoUsuario, // El correo del destinatario
            codigo: codigo // El código de verificación que deseas enviar
        }
    };

    try {
        const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Correo enviado exitosamente:', response.data);
        return { success: true, message: 'Correo enviado exitosamente.' };
    } catch (error) {
        console.error('Error al enviar el correo:', error.response?.data || error.message);
        return { success: false, message: 'Error al enviar el correo.' };
    }
}

module.exports = enviarCodigoAlCorreo;

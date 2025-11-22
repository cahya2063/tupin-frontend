<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { ref, watch } from 'vue';

const props = defineProps({
    name: String,
    email: String,
    amount: Number,
});


async function payGateway(){
    try {
        const data = {
            amount: props.amount,
            customer_details: {
                name: props.name,
                email: props.email
            }
        }
        console.log('data payment : ', data);
        
        const response = await apiFetch(`/payment/create-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        console.log("response payment :", response);
        window.snap.pay(response.data.token, {
            onSuccess: function(result){
                sweetAlert.success('pembayaran berhasil')
                console.log('result : ', result);
            },
            onPending: function(result){
                sweetAlert.warning('menunggu pembayaran...')
                console.log('result : ', result);
            },
            onError: function(result){
                sweetAlert.error('pembayaran gagal')
                console.log('result : ', result);
            },
            onClose: function(result){
                sweetAlert.warning('Anda menutup popup pembayaran tanpa menyelesaikan pembayaran')
            }
        })
    } catch (error) {
        console.error(error);
    }
}
</script>
<template>
  <div>
    <VBtn 
    color="success"
    variant="elevated" class="mt-4 mx-2"
    @click="payGateway">Bayar Sekarang</VBtn>
  </div>
</template>

import axios from 'axios';
import Noty from 'noty';
import { initAdmin } from './admin';
import moment from 'moment';
import { initStripe } from './stripe';

let addToCart = document.querySelectorAll('.add-to-cart');
let removeFromCart = document.querySelectorAll('.remove-from-cart');
let cartCounter = document.querySelector('#cartCounter');

function updateCart(food) {
    axios.post('/update-cart', food).then(res => {
        console.log(res);
        cartCounter.innerText = res.data.totalQty;

        document.getElementById(res.data.cartItem.item._id).innerText = res.data.cartItem.qty + ' Pcs';
        document.getElementById(res.data.cartItem.item._id + "Price").innerText = 'Rs. ' + res.data.cartItem.qty * res.data.cartItem.item.price;
        document.getElementById("totalPrice").innerText = 'Rs. ' + res.data.totalPrice;
        // window.location.reload();
        new Noty({
            type: 'success',
            timeout: 1000,
            text: "Item added to cart"
        }).show();
    })
        .catch(err => {
            new Noty({
                type: 'success',
                timeout: 1000,
                text: "Item added to cart"
            }).show();
        })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let food = JSON.parse(btn.dataset.food);
        updateCart(food);
    })
})


function updateRemoveCart(food) {
    axios.post('/update-remove-cart', food).then(res => {
        console.log(res);
        cartCounter.innerText = res.data.totalQty;
        if (res.data.cartItem) {
            document.getElementById(res.data.cartItem.item._id).innerText = res.data.cartItem.qty + ' Pcs';
            document.getElementById(res.data.cartItem.item._id + "Price").innerText = 'Rs. ' + res.data.cartItem.qty * res.data.cartItem.item.price;
        } else window.location.reload();

        document.getElementById("totalPrice").innerText = 'Rs. ' + res.data.totalPrice;
        // window.location.reload();
        new Noty({
            type: 'error',
            timeout: 1000,
            text: "Item removed from cart"
        }).show();
    })
        .catch(err => {
            new Noty({
                type: 'error',
                timeout: 1000,
                text: "Something went wrong"
            }).show();
        })
}

removeFromCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let food = JSON.parse(btn.dataset.food);
        updateRemoveCart(food);
    })
})


//Remove alert message after 2sec
const alertMsg = document.querySelector('#success-alert');
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove();
    }, 2000)
}


//Change order status
let statuses = document.querySelectorAll('.status_line');
let hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement('small');

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed');
        status.classList.remove('current');
    })

    let stepCompleted = true;
    statuses.forEach((status) => {
        if (stepCompleted) {
            status.classList.add('step-completed');
        }

        let dataProp = status.dataset.status;
        if (dataProp === order.status) {
            stepCompleted = false;
            time.innerText = moment(order.updatedAt).format('hh:mm: a');
            status.appendChild(time);
            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current');
            }

        }
    })
}

updateStatus(order);

// initStripe();

//Socket
let socket = io();

//Join
if (order) {
    socket.emit('join', `order-${order._id}`);
}
let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes('admin')) {
    initAdmin(socket);
    socket.emit('join', 'adminRoom');
}

socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order };
    updatedOrder.updateAt = moment().format();
    updatedOrder.status = data.status;
    updateStatus(updatedOrder);
    new Noty({
        type: 'success',
        timeout: 1000,
        text: "Order updated"
    }).show();
})




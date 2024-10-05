<template>
<div class="auth-container">
    <form v-if="isLogin" @submit.prevent="login(email, password)" class="auth-form">
        <h2 class="auth-title">Login</h2>

        <div class="form-group">
            <label for="login-email">Email:</label>
            <input v-model="email" type="email" id="login-email" placeholder="Enter your email" required />
        </div>

        <div class="form-group">
            <label for="login-password">Password:</label>
            <input v-model="password" type="password" id="login-password" placeholder="Enter your password" required />
        </div>

        <button type="submit" class="auth-button">Login</button>

        <div class="toggle">
            <p @click="toggleForm">Don't have an account? Sign Up</p>
        </div>
    </form>

    <form v-else @submit.prevent="signUp(userName, email)" class="auth-form">
        <h2 class="auth-title">Sign Up</h2>

        <div class="form-group">
            <label for="signup-userName">Username:</label>
            <input v-model="userName" type="text" id="signup-userName" placeholder="Enter your username" required />
        </div>

        <div class="form-group">
            <label for="signup-email">Email:</label>
            <input v-model="email" type="email" id="signup-email" placeholder="Enter your email" required />
        </div>

        <button type="submit" class="auth-button">SendOtp</button>

        <div class="toggle">
            <p @click="toggleForm">Already have an account? Login</p>
        </div>
    </form>
</div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            userName: '',
            email: '',
            password: '',
            confirmPassword: '',
            isLogin: true,
            restServerLocation: 'http://localhost:3000',
        };
    },

    mounted() {
        const token = localStorage.getItem('jwtToken');
        console.log("=====Mounted Calling=====", token);

        if (token) {
            console.log("=====Mounted Calling=====");
            // this.$router.go(-1);
            this.$router.back();

        }
    },
    methods: {
        toggleForm() {
            this.isLogin = !this.isLogin;
            this.resetForm();
        },

        resetForm() {
            this.userName = '';
            this.email = '';
            this.password = '';
            this.confirmPassword = '';
        },

        login(userName, password) {
            const data = {
                userName,
                password
            };
            const ax = axios.create({
                baseURL: this.restServerLocation
            });

            ax.post('api/users/authenticate', data)
                .then((response) => {
                    let user = response.data;
                    console.log("=====User=====", user);
                    if (user.user.role === "USER") {
                        this.$router.push({
                            name: 'userDetails',
                            params: {
                                userId: user.user.userId,
                            }
                        });
                    } else if (user.user.role === "ADMIN") {
                        this.$router.push({
                            name: 'adminDetails',
                            params: {
                                userId: user.user.userId,
                            }
                        });
                    }
                    localStorage.setItem('jwtToken', JSON.stringify(user.accessToken));
                    localStorage.setItem('userDetails', JSON.stringify(user));
                })
                .catch(() => {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Invalid email or password',
                        icon: 'error',
                        confirmButtonText: 'Try Again',
                    });
                });
        },

        signUp(userName, email) {
            console.log("=====userName=====", userName);
            console.log("=====email=====", email);

            const data = {
                userName: userName,
                email: email,
                password: '',
                role: 'USER',
            };

            const ax = axios.create({
                baseURL: this.restServerLocation
            });

            ax.post('api/users/register', data)
                .then((response) => {
                    console.log("======response.data======", response.data);
                    if (response.data.otpSent) {
                        Swal.fire({
                            title: 'OTP Sent!',
                            text: 'Check your email for the OTP code.',
                            icon: 'success',
                            confirmButtonText: 'OK',
                        });

                        this.verifyOtp(userName, email, response.data.otp);
                    }
                })
                .catch((error) => {
                    const message = error.response.data.message || 'Failed to create account';
                    Swal.fire({
                        title: 'Error!',
                        text: message,
                        icon: 'error',
                        confirmButtonText: 'Try Again',
                    });
                });
        },

        verifyOtp() {
            console.log("=====Email=====", this.email);

            Swal.fire({
                title: 'Enter OTP and Password',
                html: `
            <input id="otp" class="swal2-input" placeholder="Enter the OTP sent to your email">
            <input id="password" type="password" class="swal2-input" placeholder="Enter your password">
            <input id="confirmPassword" type="password" class="swal2-input" placeholder="Confirm your password">
        `,
                showCancelButton: true,
                confirmButtonText: 'Verify',
                preConfirm: () => {
                    const otp = document.getElementById('otp').value;
                    const newPassword = document.getElementById('password').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;

                    if (!otp || !newPassword || !confirmPassword) {
                        Swal.showValidationMessage(`Please enter OTP, password, and confirm password`);
                        return false;
                    } else if (newPassword !== confirmPassword) {
                        Swal.showValidationMessage(`Passwords do not match`);
                        return false;
                    }

                    return {
                        otp,
                        newPassword
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const {
                        otp,
                        newPassword
                    } = result.value;
                    console.log("=====Entered OTP=====", otp);

                    const updateData = {
                        // userName,
                        email:this.email,
                        otp,
                        newPassword
                    };

                    const ax = axios.create({
                        baseURL: this.restServerLocation
                    });
                    console.log("=====Data=====", updateData);
                    ax.post('api/users/verifyOtp', updateData)
                        .then(() => {
                            Swal.fire('Success!', 'Your account has been created and your password is set.', 'success');
                            this.toggleForm();
                        })
                        .catch((err) => {
                            console.log("=====Error Response=====", err);
                            Swal.fire({
                                title: 'Error!',
                                text: 'Failed to set password',
                                icon: 'error',
                                confirmButtonText: 'Try Again',
                            });
                        });
                }
            });
        }

    },
};
</script>

<style scoped>
.auth-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 75vh;
    background-color: #f0f2f5;
}

.auth-form {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    max-width: 400px;
    width: 100%;
}

.auth-title {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #333;
    text-align: center;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #555;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}

.auth-button {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    font-size: 1rem;
    cursor: pointer;
}

.auth-button:hover {
    background-color: #0056b3;
}

.toggle {
    margin-top: 1rem;
    text-align: center;
    cursor: pointer;
    color: #007bff;
}

.toggle:hover {
    text-decoration: underline;
}
</style>

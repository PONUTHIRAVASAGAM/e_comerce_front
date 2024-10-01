<template>
<div class="component">
    <b-container>
        <div>
            <b-navbar type="dark" variant="dark">
                <b-navbar-nav class="mr-auto">
                    <b-nav-item v-if="userDetails"><b>User: {{user.user.userName }}</b></b-nav-item>
                    <!-- <b-button variant="light">Boards</b-button> -->
                </b-navbar-nav>
                <b-navbar-nav class="ml-auto">
                    <b-button v-if="userDetails" variant="success" @click="logout()">Logout</b-button>
                    <b-button v-if="!userDetails" variant="success" @click="loginPage()">Login</b-button>
                    <!-- <b-button v-if="userDetails" variant="success" @click="loginPage()">Logout</b-button> -->
                </b-navbar-nav>
            </b-navbar>
        </div>

        <div>
            <b-card no-body>
                <b-tabs pills card>
                    <b-tab title="Products" @click="getAllProducts()" active>
                        <b-card-text>

                            <!-- <div class="container mt-4"> -->
                            <!-- <div class="row"> -->
                            <!-- <div class="col-md-4" v-for="product in allProducts" :key="product.id"> -->
                            <!-- <b-card :title="product.productName" class="mb-3"> -->
                            <!-- <b-img :src="product.productImage" alt="Product Image" fluid /> -->
                            <!-- <b-img :src="getImageUrl(product.productImage)" alt="Product Image" fluid></b-img> -->
                            <!-- <b-card-text> -->
                            <!-- {{ product.productDescription }} -->
                            <!-- </b-card-text> -->
                            <!-- <b-card-footer> -->
                            <!-- <strong>Price: {{ product.sellingPrice }}Rs</strong> -->
                            <!-- <b-button variant="primary" @click="orderModal(product)">Add to Cart</b-button> -->
                            <!-- </b-card-footer> -->
                            <!-- </b-card> -->
                            <!-- </div> -->
                            <!-- </div> -->
                            <!-- </div> -->

                            <div class="container mt-4">
                                <!-- <div class="row mb-3"> -->
                                <!-- <div class="col-md-6"> -->
                                <!-- <b-form inline> -->
                                <!-- <b-form-group label="Search" label-for="search-input"> -->
                                <!-- <b-form-input id="search-input" v-model="searchTerm" placeholder="Search for products..." class="mr-2"></b-form-input> -->
                                <!-- </b-form-group> -->
                                <!-- <b-button variant="primary" @click="clearSearch">Clear</b-button> -->
                                <!-- </b-form> -->
                                <!-- </div> -->
                                <!-- </div> -->

                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <b-form inline>
                                            <b-form-group label="Search" label-for="search-input" class="mb-0">
                                                <b-input-group>
                                                    <b-form-input id="search-input" v-model="searchTerm" placeholder="Search for products..." class="mr-2"></b-form-input>
                                                    <b-input-group-append>
                                                        <b-button v-if="searchTerm" @click="clearSearch" variant="outline-secondary" aria-label="Clear search">
                                                            <b-icon icon="x-circle" variant="danger"></b-icon>
                                                        </b-button>
                                                    </b-input-group-append>
                                                </b-input-group>
                                            </b-form-group>
                                        </b-form>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-4" v-for="product in filteredProducts" :key="product.id">
                                        <b-card :title="product.productName" class="mb-3">
                                            <b-img :src="product.productImage" alt="Product Image" fluid />
                                            <b-card-text>
                                                {{ product.productDescription }}
                                            </b-card-text>
                                            <b-card-footer>
                                                <strong>Price: {{ product.sellingPrice }} Rs</strong>
                                                <b-button variant="primary" @click="orderModal(product)">Add to Cart</b-button>
                                            </b-card-footer>
                                        </b-card>
                                    </div>
                                </div>
                            </div>

                            <b-modal id="orderModal" title="Place Order" hide-header-close no-close-on-backdrop>
                                <div class="my-4">
                                    <form>
                                        <b-form-group label="Payment Type:" label-for="payment-type">
                                            <b-form-radio-group id="payment-type" v-model="paymentType" name="paymentType" required @change="resetPaymentMethod">
                                                <b-form-radio value="Online">Online</b-form-radio>
                                                <b-form-radio value="Offline">COD</b-form-radio>
                                            </b-form-radio-group>
                                        </b-form-group>
                                        <!-- Show additional payment types if 'Online' is selected -->
                                        <div v-if="paymentType === 'Online'">
                                            <b-form-group label="Select Online Payment Type:" label-for="online-payment-type">
                                                <b-form-radio-group id="online-payment-type" v-model="paymentMethod" name="paymentMethod" required>
                                                    <b-form-radio value="Credit Card">Credit Card</b-form-radio>
                                                    <b-form-radio value="Debit Card">Debit Card</b-form-radio>
                                                    <b-form-radio value="PayPal">PayPal</b-form-radio>
                                                </b-form-radio-group>
                                            </b-form-group>
                                        </div>
                                        <b-form-group label="Product Count:" label-for="product-count">
                                            <b-form-input id="product-count" type="number" v-model="productCount" min="1" @input="validateProductCount" required></b-form-input>
                                        </b-form-group>
                                        <b-form-group label="Delivery Address:" label-for="delivery-address">
                                            <b-form-textarea id="delivery-address" v-model="deliveryAddress" required rows="3"></b-form-textarea>
                                        </b-form-group>
                                    </form>
                                </div>
                                <template #modal-footer>
                                    <b-button variant="secondary" @click="resetForm()">Cancel</b-button>
                                    <b-button variant="primary" @click="createOrder()">Submit</b-button>
                                </template>
                            </b-modal>

                        </b-card-text>
                    </b-tab>
                    <b-tab title="My Order Details" @click="getOrdersByUserId()" v-if="userDetails">
                        <b-card-text>

                            <b-table :items="sortedOrders" :fields="ordersFields" striped hover responsive :per-page="perPage" :current-page="currentPage" @update:current-page="updatePage" @update:per-page="updatePerPage" sortable>
                                <!-- <template #cell(image)="data"> -->
                                <!-- <b-img :src="data.item.productImage" alt="Product Image" fluid /> -->
                                <!-- </template> -->
                                <template #cell(deliveryStatus)="data">
                                    <div>
                                        <b-button v-if="!data.item.deliveryStatus" variant="warning">
                                            Pending
                                        </b-button>
                                        <b-button v-else variant="success">
                                            Delivered
                                        </b-button>
                                    </div>
                                </template>
                            </b-table>
                            <b-pagination v-model="currentPage" :per-page="perPage" :total-rows="sortedOrders.length" @change="updatePage" />
                            <div class="mt-3">
                                <label for="perPageSelect">Items per page:</label>
                                <b-form-select id="perPageSelect" v-model="perPage" :options="perPageOptions" @change="updatePerPage" />
                            </div>
                        </b-card-text>
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>

    </b-container>
</div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
// import draggable from 'vuedraggable';

export default {
    name: 'UserPage',
    components: {
        // draggable,
    },
    data() {
        return {
            searchTerm: '',
            userDetails: null,
            currentPage: 1,
            perPage: 5,
            perPageOptions: [5, 10, 20, 50, 100],
            sortedField: '',
            isAscending: true,
            products: [],
            orders: [],
            ordersFields: [{
                    key: 'productName',
                    label: 'Product Name'
                },
                {
                    key: 'originalPrice',
                    label: 'Original Price'
                },
                {
                    key: 'discountPrice',
                    label: 'Discount Price'
                },
                {
                    key: 'sellingPrice',
                    label: 'Selling Price'
                },
                {
                    key: 'quantity',
                    label: 'Quantity'
                },
                {
                    key: 'deliveryAddress',
                    label: 'Address'
                },
                {
                    key: 'paymentStatus',
                    label: 'PaymentStatus'
                },
                {
                    key: 'paymentType',
                    label: 'PaymentType'
                },
                {
                    key: 'paymentType',
                    label: 'PaymentMethod'
                },
                {
                    key: 'deliveryStatus',
                    label: 'deliveryStatus'
                },
            ],
            deliveryStatus: '',
            paymentType: '',
            paymentMethod: '',
            paymentStatus: '',
            productCount: null,
            deliveryAddress: '',

            allProducts: [],
            productDetails: [],
            columns: [],
            cards: [],
            message: '',
            listName: '',
            cardName: '',
            cardDescription: '',
            columnDetails: '',
            user: JSON.parse(localStorage.getItem("userDetails")) || {},
            restServerLocation: 'http://localhost:3000',
        };
    },

    computed: {
        sortedOrders() {
            // Sort the products based on the selected field and order
            let sorted = [...this.orders];
            if (this.sortedField) {
                sorted.sort((a, b) => {
                    const modifier = this.isAscending ? 1 : -1;
                    if (a[this.sortedField] < b[this.sortedField]) return -1 * modifier;
                    if (a[this.sortedField] > b[this.sortedField]) return 1 * modifier;
                    return 0;
                });
            }
            return sorted;
        },
        paginatedOrders() {
            const start = (this.currentPage - 1) * this.perPage;
            return this.sortedOrders.slice(start, start + this.perPage);
        },
        filteredProducts() {
            return this.allProducts.filter(product => {
                return product.productName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    product.productDescription.toLowerCase().includes(this.searchTerm.toLowerCase());
            });
        }

    },

    async mounted() {
        axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('jwtToken');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        this.fetchUserDetails();
        await this.getAllProducts();
        // await this.checkLocalStorageAndRedirect();
    },
    methods: {

        // demoFunction(columnDetails, cardName) {
        // console.log("=====Demo Function Calling=====");
        // console.log("=====columnDetails=====", columnDetails);
        // console.log("=====cardName=====", cardName);
        // 
        // },

        // enlargeImage() {
        // this.$bvModal.show('imageModal');
        // },

        clearSearch() {
            this.searchTerm = '';
        },

        fetchUserDetails() {
            // Retrieve user details from local storage
            const userData = localStorage.getItem('userDetails');
            if (userData) {
                this.userDetails = JSON.parse(userData); // Parse the JSON string
            }
            console.log("=====userDetails=====", this.userDetails);

        },

        loginPage() {
            this.$router.push('/login');
        },

        // orderModal(product) {
        // this.productDetails = product;
        // console.log("=====Order Modal Calling=====");
        // console.log("=====Product=====", product);
        // 
        // this.$bvModal.show('orderModal');
        // this.orderModal= true
        // 
        // },

        orderModal(product) {
            // Check if userDetails is not null
            const userDetails = JSON.parse(localStorage.getItem('userDetails'));

            if (userDetails) {
                this.productDetails = product;
                console.log("=====Order Modal Calling=====");
                console.log("=====Product=====", product);
                this.$bvModal.show('orderModal');
            } else {
                // Confirm before redirecting to login page
                Swal.fire({
                    title: 'Not Logged In',
                    text: 'You need to log in to proceed. Do you want to go to the login page?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, go to login',
                    cancelButtonText: 'No, stay here'
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.$router.push('/login'); // Redirect to login
                    }
                    // If cancelled, do nothing (stay on the current page)
                });
            }
        },

        resetPaymentMethod() {
            if (this.paymentType !== 'Online') {
                this.paymentMethod = '';
            }
        },

        validateProductCount() {
            if (this.productCount < 1) {
                this.productCount = 1;
            }
        },

        // getImageUrl(imagePath) {
        // Use only the filename from the path and ensure correct path handling
        // const fileName = imagePath.split('\\').pop(); // Get the file name
        // const url = `http://localhost:3000/uploads/${fileName}`; // Construct the URL
        // console.log("Image URL:", url); // Log the URL for debugging
        // return url;
        // },
        // 
        getAllProducts() {
            axios.get('http://localhost:3000/api/products/viewAllProducts')
                .then((res) => {
                    this.allProducts = res.data;
                    console.log("Fetched All Products:", this.allProducts);
                })
                .catch((err) => {
                    console.error("Error fetching products:", err);
                });
        },

        createOrder() {
            console.log("=====ProductDetails=====", this.productDetails);

            if (!this.productDetails || !this.paymentType || !this.productCount || !this.deliveryAddress) {
                Swal.fire({
                    title: "Error!",
                    text: "Please fill all the fields...!!!",
                    icon: "error",
                    confirmButtonText: "Try Again",
                });
                return;
            }

            if (this.paymentType === "Offline") {
                this.paymentMethod = "Cash";
            } else if (this.paymentType === "Online" && !this.paymentMethod) {
                Swal.fire({
                    title: "Error!",
                    text: "Please select an online payment type...!!!",
                    icon: "error",
                    confirmButtonText: "Try Again",
                });
                return;
            }

            const deliveryDetails = {
                paymentType: this.paymentType,
                customerId: this.user.user.userId,
                paymentMethod: this.paymentMethod,
                productCount: this.productCount,
                deliveryAddress: this.deliveryAddress,
                productDetails: this.productDetails,
            };

            axios.post('http://localhost:3000/api/orders/createOrder', deliveryDetails)
                .then(response => {
                    console.log("Order Created:", response.data);
                    Swal.fire({
                        title: "Success!",
                        text: "Order created successfully!",
                        icon: "success",
                        confirmButtonText: "Okay",
                    });
                })
                .catch(error => {
                    console.error("Error creating order:", error.response ? error.response.data : error.message);
                    Swal.fire({
                        title: "Error!",
                        text: error.response ? error.response.data.message : "An error occurred!",
                        icon: "error",
                        confirmButtonText: "Try Again",
                    });
                })
                .finally(() => {
                    this.resetForm();
                    // this.$bvModal.hide('orderModal');
                });
        },

        resetForm() {
            this.$bvModal.hide('orderModal');
            this.productDetails = null,
                // this.deliveryStatus = '';
                this.paymentType = '';
            // this.paymentStatus = '';
            this.productCount = null;
            this.deliveryAddress = '';
        },

        getOrdersByUserId() {
            axios.get('http://localhost:3000/api/orders/viewCustomerOrders/' + this.user.user.userId)
                .then((res) => {
                    this.orders = res.data;
                    console.log("Fetched Orders:", this.orders);
                })
                .catch((err) => {
                    console.error("Error fetching products:", err);
                });
        },

        updatePage(page) {
            this.currentPage = page;
        },
        updatePerPage(count) {
            this.perPage = count;
            this.currentPage = 1;
        },
        handleSort(field) {
            if (this.sortedField === field) {
                this.isAscending = !this.isAscending;
            } else {
                this.sortedField = field;
                this.isAscending = true;
            }
            this.currentPage = 1;
        },

        checkLocalStorageAndRedirect() {
            if (!localStorage.getItem('userDetails')) {
                this.$router.push({
                    name: 'userHome'
                });
            }
        },
        logout() {
            console.log("=====Logout Calling=====");
            localStorage.clear();
            // window.location.reload();
            this.$router.push('/e_comerce');
            // this.$router.push({
            // name: 'userHome'
            // });
        },

    },
};
</script>

<style scoped>
.component {
    text-align: center;
    margin-top: 50px;
}

.ml-auto {
    margin-left: auto;
}

.mr-auto {
    margin-right: auto;
}

.columns-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.column {
    background-color: #f8f9fa;
    padding: 20px;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    width: 24%;
    text-align: center;
    position: relative;
}

.delete-button {
    position: absolute;
    /* top: 5px; */
    /* right: 5px; */
    margin-left: 25%;
    background-color: transparent;
    border: none;
    color: #dc3545;
    font-size: 20px;
    cursor: pointer;
}

.addCard-button {
    margin-left: 65%;
}

.listTittle {
    margin-left: -50%;
    padding-top: -50%;
    padding-bottom: -50%;

}

.center {
    margin: auto;
    width: 50%;
    border: 3px solid green;
    padding: 10px;
}

.columns-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.column {
    background-color: #f8f9fa;
    padding: 20px;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    width: 300px;
    min-height: 200px;
    text-align: center;
    position: relative;
}

.drag-area {
    min-height: 100px;
    padding: 10px;
    border: 1px dashed #ced4da;
    border-radius: 5px;
}

.close-icon {
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
}

.custom-card {
    margin: 10px auto;
    width: 100%;
    height: 100%;
    max-height: 800px;
    max-width: 400px;
}

#card {
    margin-top: 5%;
}

#list {
    margin-left: -1.6%;
}

@media (max-width: 768px) {
    .columns-container {
        flex-direction: column;
    }

    .column {
        width: 100%;
        margin-bottom: 10px;
    }

    .b-navbar-nav {
        flex: 1;
        justify-content: center;
    }
}
</style>

<template>
<div class="component">
    <b-container>
        <div>
            <b-navbar type="dark" variant="dark">
                <b-navbar-nav class="mr-auto">
                    <b-nav-item><b>Admin: {{user.user.userName }}</b></b-nav-item>
                    <!-- <b-button variant="light">Boards</b-button> -->
                </b-navbar-nav>
                <b-navbar-nav class="ml-auto">
                    <b-button variant="success" @click="logout()">Logout</b-button>
                </b-navbar-nav>
            </b-navbar>
        </div>
        <div>
            <b-button pill variant="outline-primary" class="addCard-button" size="sm" v-b-modal.productModal>
                Add Product
            </b-button>
            <div>
                <!-- Modal Component -->
                <b-modal id="productModal" title="Add New Product" hide-header-close no-close-on-backdrop>
                    <div class="my-4">
                        <b-form-group label="Product Name:" label-for="input-text">
                            <b-form-input id="input-text" v-model="productName" placeholder="Card Name" required></b-form-input>
                        </b-form-group>
                        <br>
                        <b-form-group label="Description" label-for="description-textarea">
                            <b-form-textarea id="description-textarea" v-model="productDescription" placeholder="Enter a description" rows="3" max-rows="6"></b-form-textarea>
                        </b-form-group>

                        <b-form-group label="Image Upload:" label-for="productImage">
                            <b-form-file id="productImage" :state="!!productImage" accept="image/*" @change="onFileChange" placeholder="" drop-placeholder="" style="max-width: 400px;" required></b-form-file>
                        </b-form-group>

                        <b-form-group label="Original Price:" label-for="originalPrice">
                            <b-form-input id="originalPrice" type="number" v-model="originalPrice" placeholder="Enter original price" required></b-form-input>
                        </b-form-group>

                        <b-form-group label="Discount Price:" label-for="discountPrice">
                            <b-form-input id="discountPrice" type="number" v-model="discountPrice" placeholder="Enter discount price"></b-form-input>
                        </b-form-group>

                        <b-form-group label="Selling Price:" label-for="sellingPrice">
                            <b-form-input id="sellingPrice" type="number" v-model="sellingPrice" placeholder="Enter selling price" required></b-form-input>
                        </b-form-group>

                        <b-form-group label="Quantity:" label-for="quantity">
                            <b-form-input id="quantity" type="number" v-model="quantity" placeholder="Enter quantity" required></b-form-input>
                        </b-form-group>

                        <b-form-group label="Unit of Measure:" label-for="uom">
                            <b-form-input id="uom" v-model="uom" placeholder="Enter unit of measure" required></b-form-input>
                        </b-form-group>

                        <b-form-group label="HSN Code:" label-for="hsnCode">
                            <b-form-input id="hsnCode" v-model="hsnCode" placeholder="Enter HSN code" required></b-form-input>
                        </b-form-group>

                    </div>
                    <template #modal-footer>
                        <b-button variant="secondary" @click="cancelProduct()">Cancel</b-button>
                        <b-button variant="primary" @click="addProduct()">Submit</b-button>
                    </template>
                </b-modal>
            </div>
        </div>

        <div>
            <b-card no-body>
                <b-tabs pills card>
                    <b-tab title="Products" @click="getProductsByUserId()" active>
                        <b-card-text>
                            <b-table :items="sortedProducts" :fields="productsFields" striped hover responsive :per-page="perPage" :current-page="currentPage" @update:current-page="updatePage" @update:per-page="updatePerPage" sortable>
                                <template #cell(image)="data">
                                    <b-img :src="data.item.productImage" alt="Product Image" fluid />
                                </template>

                                <template #cell(actions)="data">
                                    <b-button variant="danger" @click="confirmDelete(data.item)">
                                        Delete
                                    </b-button>
                                </template>

                            </b-table>

                            <b-pagination v-model="currentPage" :per-page="perPage" :total-rows="sortedProducts.length" @change="updatePage" />

                            <div class="mt-3">
                                <label for="perPageSelect">Items per page:</label>
                                <b-form-select id="perPageSelect" v-model="perPage" :options="perPageOptions" @change="updatePerPage" />
                            </div>
                        </b-card-text>
                    </b-tab>
                    <b-tab title="Orders" @click="getOrdersByUserId()">
                        <b-card-text>
                            <b-table :items="sortedOrders" :fields="ordersFields" striped hover responsive :per-page="perPage" :current-page="currentPage" @update:current-page="updatePage" @update:per-page="updatePerPage" sortable>
                                <!-- <template #cell(image)="data"> -->
                                <!-- <b-img :src="data.item.productImage" alt="Product Image" fluid /> -->
                                <!-- </template> -->

                                <template #cell(deliveryStatus)="data">
                                    <div>
                                        <b-button v-if="!data.item.deliveryStatus" variant="danger" @click="deliverOrder(data.item)">
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
            currentPage: 1,
            perPage: 5,
            perPageOptions: [5, 10, 20, 50, 100],
            sortedField: '',
            isAscending: true,
            products: [],
            orders: [],
            showModal: false,
            productName: '',
            productDescription: '',
            productImage: null,
            originalPrice: null,
            discountPrice: null,
            sellingPrice: null,
            quantity: null,
            uom: '',
            hsnCode: '',
            message: '',
            user: JSON.parse(localStorage.getItem("userDetails")) || {},
            restServerLocation: 'http://localhost:3000',
            productsFields: [{
                    key: 'productName',
                    label: 'Product Name'
                },
                {
                    key: 'productDescription',
                    label: 'Description'
                },
                // {
                // key: 'image',
                // label: 'Image',
                // formatter: (value) => value
                // },
                {
                    key: 'image',
                    label: 'Image'
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
                    key: 'uom',
                    label: 'Unit of Measure'
                },
                {
                    key: 'hsnCode',
                    label: 'HSN Code'
                },
                {
                    key: 'actions',
                    label: 'Actions'
                },
            ],

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
        };
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

        // console.log(this.user.user.userId);

        // await this.checkLocalStorageAndRedirect();
        await this.getProductsByUserId();
    },

    computed: {

        sortedProducts() {
            // Sort the products based on the selected field and order
            let sorted = [...this.products];
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
        paginatedProducts() {
            const start = (this.currentPage - 1) * this.perPage;
            return this.sortedProducts.slice(start, start + this.perPage);
        },

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
    },

    methods: {

        // demoFunction(columnDetails, cardName) {
        // console.log("=====Demo Function Calling=====");
        // console.log("=====columnDetails=====", columnDetails);
        // console.log("=====cardName=====", cardName);
        // 
        // },

        confirmDelete(item) {
            Swal.fire({
                title: 'Are you sure?',
                text: 'This action cannot be undone!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.deleteOrder(item);
                }
            });
        },

        deleteOrder(item) {
            axios.delete('http://localhost:3000/api/products/deleteProductById/' + item.productId)
                .then(response => {
                    console.log('Order deleted:', response.data);
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Product has been deleted...!!!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                    this.getProductsByUserId();
                })
                .catch(error => {
                    console.error('Error deleting order:', error.response ? error.response.data : error.message);
                    Swal.fire({
                        title: 'Error!',
                        text: 'There was an error deleting the product...!!!',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
        },

        deliverOrder(item) {
            Swal.fire({
                title: 'Confirm Delivery',
                text: 'Are you sure you want to mark this order as delivered?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, deliver it!',
                cancelButtonText: 'No, cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    return new Promise((resolve, reject) => {
                        axios.post('http://localhost:3000/api/orders/updateDeliveryStatus', {
                                orderId: item.orderId,
                                deliveryStatus: true,
                            })
                            .then(response => {
                                console.log('Delivery status updated:', response.data);
                                item.deliveryStatus = true;
                                Swal.fire({
                                    title: 'Success!',
                                    text: 'Order has been Delivered...!!!',
                                    icon: 'success',
                                    confirmButtonText: 'OK'
                                });
                                this.getOrdersByUserId();
                                resolve(response.data);
                            })
                            .catch(error => {
                                console.error('Error updating delivery status:', error.response ? error.response.data : error.message);
                                reject(error);
                            });
                    });
                } else {
                    Swal.fire({
                        title: 'Canceled',
                        text: 'Delivery process was canceled.',
                        icon: 'info',
                        confirmButtonText: 'OK'
                    });
                }
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

        onFileChange(event) {
            const file = event.target.files[0];
            if (file) {
                this.productImage = file;
            } else {
                this.productImage = null;
            }
        },

        addProduct() {
            if (!this.productName ||
                !this.productDescription ||
                !this.productImage ||
                !this.originalPrice ||
                !this.sellingPrice ||
                !this.quantity ||
                !this.uom ||
                !this.hsnCode) {
                Swal.fire({
                    title: "Error!",
                    text: "Please fill all the fields...!!!",
                    icon: "error",
                    confirmButtonText: "Try Again",
                });
                return;
            }

            console.log("======this.productImage=======", this.productImage);

            const formData = new FormData();
            formData.append('ownerId', this.user.user.userId);
            formData.append('productName', this.productName);
            formData.append('productDescription', this.productDescription);
            formData.append('productImage', this.productImage); // This is now a File object
            formData.append('originalPrice', this.originalPrice);
            formData.append('discountPrice', this.discountPrice);
            formData.append('sellingPrice', this.sellingPrice);
            formData.append('quantity', this.quantity);
            formData.append('uom', this.uom);
            formData.append('hsnCode', this.hsnCode);

            axios.post('http://localhost:3000/api/products/createProduct', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then((response) => {
                    this.message = 'Product created successfully!';
                    console.log('Product:', response.data);
                    this.resetForm();

                    Swal.fire({
                        title: 'Success!',
                        text: 'Product has been added...!!!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                    this.getProductsByUserId();
                    this.$bvModal.hide('productModal');
                })
                .catch((error) => {
                    this.message = 'Error creating product: ' + (error.response.data.message || 'An error occurred');
                    console.error('Error:', error);
                });
        },

        resetForm() {
            this.productName = '';
            this.productDescription = '';
            this.productImage = null;
            this.originalPrice = null;
            this.discountPrice = null;
            this.sellingPrice = null;
            this.quantity = null;
            this.uom = '';
            this.hsnCode = '';
        },

        closeModal() {
            this.showModal = false;
        },
        showTheModal() {
            // console.log("=========Show MOdal Calling=======");
            this.showModal = true;
            console.log("========this.showModal=======", this.showModal);
        },

        getProductsByUserId() {
            axios.get('http://localhost:3000/api/products/viewProducts/' + this.user.user.userId)
                .then((res) => {
                    this.products = res.data;
                    console.log("Fetched Products:", this.products);
                })
                .catch((err) => {
                    console.error("Error fetching products:", err);
                });
        },

        getOrdersByUserId() {
            axios.get('http://localhost:3000/api/orders/viewOwnerOrders/' + this.user.user.userId)
                .then((res) => {
                    this.orders = res.data;
                    console.log("Fetched Orders:", this.orders);
                })
                .catch((err) => {
                    console.error("Error fetching products:", err);
                });
        },

        checkLocalStorageAndRedirect() {
            if (!localStorage.getItem('userDetails')) {
                this.$router.push({
                    name: 'userHome'
                });
            }
        },

        fetchUserDetails() {
            // Retrieve user details from local storage
            const userData = localStorage.getItem('userDetails');
            if (userData) {
                this.userDetails = JSON.parse(userData); // Parse the JSON string
            }
            console.log("=====userDetails=====", this.userDetails);
        },
        clearLocalStorage() {
            localStorage.clear();
        },
        async logout() {
            console.log("===== Logout Calling =====");
            // localStorage.clear();
            await this.clearLocalStorage();
            await this.fetchUserDetails();
            // location.reload();
            this.$router.push('/e_comerce');
        },
        // logout() {
        // localStorage.clear();
        // this.$router.push({
        // name: 'userHome'
        // });
        // },

        cancelProduct() {
            this.productName = '';
            this.productDescription = '';
            this.productImage = '';
            this.originalPrice = null;
            this.discountPrice = null;
            this.sellingPrice = null;
            this.quantity = null;
            this.uom = '';
            this.hsnCode = '';
            this.$bvModal.hide('productModal');
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

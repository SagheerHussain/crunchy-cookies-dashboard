import { lazy } from 'react';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

import AddOrEditProduct from '../views/ui-elements/products/AddOrEditProduct';
import ViewProducts from '../views/ui-elements/products/ViewProducts';
import ViewBrands from '../views/ui-elements/brands/ViewBrands';
import AddOrEditBrands from '../views/ui-elements/brands/AddOrEditBrands';
import ViewCategory from '../views/ui-elements/categories/ViewCategory';
import AddOrEditCategory from '../views/ui-elements/categories/AddOrEditCategory';
import ViewCategoryType from '../views/ui-elements/categoriesType/ViewCategoryType';
import AddOrEditCategoryType from '../views/ui-elements/categoriesType/AddorEditCategoryType';
import ViewSubCategories from '../views/ui-elements/sub categories/ViewSubCategories';
import AddOrEditSubCategories from '../views/ui-elements/sub categories/AddOrEditSubCategories';
import ViewOccasion from '../views/ui-elements/occasions/ViewOccasion';
import AddOrEditOccasion from '../views/ui-elements/occasions/AddOrEditOccasion';
import ViewRecipient from '../views/ui-elements/recipients/ViewRecipients';
import AddOrEditRecipient from '../views/ui-elements/recipients/AddOrEditRecipient';
import ViewPackaging from '../views/ui-elements/packaging/ViewPackaging';
import AddOrEditPackaging from '../views/ui-elements/packaging/AddOrEditPackaging';
import ViewColors from '../views/ui-elements/colors/ViewColors';
import AddOrEditColors from '../views/ui-elements/colors/AddOrEditColors';
import ViewOrders from '../views/ui-elements/orders/ViewOrders';
import ViewOrderDetail from '../views/ui-elements/orders/ViewOrderDetail';
import EditOrder from '../views/ui-elements/orders/EditOrder';
import ViewCustomers from '../views/ui-elements/customers/ViewCustomers';
import EditCustomer from '../views/ui-elements/customers/EditCustomer';

const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));

const Typography = lazy(() => import('../views/ui-elements/basic/BasicTypography'));
const Color = lazy(() => import('../views/ui-elements/basic/BasicColor'));

const FeatherIcon = lazy(() => import('../views/ui-elements/icons/Feather'));
const FontAwesome = lazy(() => import('../views/ui-elements/icons/FontAwesome'));
const MaterialIcon = lazy(() => import('../views/ui-elements/icons/Material'));

const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));

const Sample = lazy(() => import('../views/sample'));
import RequireAdmin from './RequireAdmin';

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <RequireAdmin>
          <AdminLayout />
        </RequireAdmin>
      ),
      children: [
        {
          path: '/', 
          element: <DashboardSales />
        },
        {
          path: '/typography',
          element: <Typography />
        },
        {
          path: '/colors',
          element: <ViewColors />
        },
        {
          path: '/colors/add',
          element: <AddOrEditColors />
        },
        {
          path: '/colors/edit/:id',
          element: <AddOrEditColors />
        },
        {
          path: '/products',
          element: <ViewProducts />
        },
        {
          path: '/products/add',
          element: <AddOrEditProduct />
        },
        {
          path: '/products/edit/:id',
          element: <AddOrEditProduct />
        },
        {
          path: '/brands',
          element: <ViewBrands />
        },
        {
          path: '/brands/add',
          element: <AddOrEditBrands />
        },
        {
          path: '/brands/edit/:id',
          element: <AddOrEditBrands />
        },
        {
          path: '/occasions',
          element: <ViewOccasion />
        },
        {
          path: '/occasions/add',
          element: <AddOrEditOccasion />
        },
        {
          path: '/occasions/edit/:id',
          element: <AddOrEditOccasion />
        },
        {
          path: '/recipients',
          element: <ViewRecipient />
        },
        {
          path: '/recipients/add',
          element: <AddOrEditRecipient />
        },
        {
          path: '/recipients/edit/:id',
          element: <AddOrEditRecipient />
        },
        {
          path: '/packaging',
          element: <ViewPackaging />
        },
        {
          path: '/packaging/add',
          element: <AddOrEditPackaging />
        },
        {
          path: '/packaging/edit/:id',
          element: <AddOrEditPackaging />
        },
        {
          path: '/categories',
          element: <ViewCategory />
        },
        {
          path: '/categories/add',
          element: <AddOrEditCategory />
        },
        {
          path: '/categories/edit/:id',
          element: <AddOrEditCategory />
        },
        {
          path: '/categoryTypes',
          element: <ViewCategoryType />
        },
        {
          path: '/categoryTypes/add',
          element: <AddOrEditCategoryType />
        },
        {
          path: '/categoryTypes/edit/:id',
          element: <AddOrEditCategoryType />
        },
        {
          path: '/subCategories',
          element: <ViewSubCategories />
        },
        {
          path: '/subCategories/add',
          element: <AddOrEditSubCategories />
        },
        {
          path: '/subCategories/edit/:id',
          element: <AddOrEditSubCategories />
        },
        {
          path: '/orders',
          element: <ViewOrders />
        },
        {
          path: "/order-detail/:id",
          element: <ViewOrderDetail />
        },
        {
          path: '/orders/edit/:id',
          element: <EditOrder />
        },
        {
          path: '/customers',
          element: <ViewCustomers />
        },
        {
          path: '/customers/edit/:id',
          element: <EditCustomer />
        },
        {
          path: '/icons/Feather',
          element: <FeatherIcon />
        },
        {
          path: '/icons/font-awesome-5',
          element: <FontAwesome />
        },
        {
          path: '/icons/material',
          element: <MaterialIcon />
        },

        {
          path: '/sample-page',
          element: <Sample />
        }
      ]
    },
    {
      path: '/',
      element: <GuestLayout />,
      children: [
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/register',
          element: <Register />
        }
      ]
    }
  ]
};

export default MainRoutes;

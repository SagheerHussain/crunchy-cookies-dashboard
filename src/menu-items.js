// Menu configuration for default layout
const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'dashboard', // updated
          url: '/',
          // children: [
          //   {
          //     id: 'sales',
          //     title: 'Sales',
          //     type: 'item',
          //     url: '/',
          //     icon: 'material-icons-two-tone',
          //     iconname: 'bar_chart' // sales = bar chart
          //   }
          // ]
        }
      ]
    },
    {
      id: 'ui-element',
      title: 'Customers',
      subtitle: 'UI Components',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'customers',
          title: 'Customers',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'people',  // ✅ fixed (was 'product')
          url: '/customers'
        }
      ]
    },
    {
      id: 'ui-element',
      title: 'Products',
      subtitle: 'UI Components',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'products',
          title: 'Products',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'shopping_bag',  // ✅ fixed (was 'product')
          url: '/products'
        },
        {
          id: 'recipes',
          title: 'Recipes',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'style', // category types
          url: '/categoryTypes'
        }
      ]
    },
    {
      id: 'ui-element',
      title: 'Orders',
      subtitle: 'UI Components',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'orders',
          title: 'Orders',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'shopping_cart',
          url: '/orders'
        }
      ]
    },
    {
      id: 'ui-element',
      title: 'Categories',
      subtitle: 'UI Components',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'categories',
          title: 'Categories',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'category',
          url: '/categories'
        },
        {
          id: 'subCategories',
          title: 'Sub Categories',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'layers', // sub categories
          url: '/subCategories'
        },
        // {
        //   id: 'categoryType',
        //   title: 'Recipes',
        //   type: 'item',
        //   icon: 'material-icons-two-tone',
        //   iconname: 'style', // category types
        //   url: '/categoryTypes'
        // }
      ]
    },
    {
      id: 'ui-element',
      title: 'Brands',
      subtitle: 'UI Components',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'brands',
          title: 'Brands',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'store', // brands = store/shop
          url: '/brands'
        }
      ]
    },
    {
      id: 'ui-element',
      title: 'Occasions',
      subtitle: 'UI Components',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'occasions',
          title: 'Occasions',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'event', // recipients = people
          url: '/occasions'
        }
      ]
    },
    {
      id: 'ui-element',
      title: 'Recipients',
      subtitle: 'UI Components',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'recipients',
          title: 'Recipients',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'people', // recipients = people
          url: '/recipients'
        }
      ]
    },
    {
      id: 'ui-element',
      title: 'Packaging',
      subtitle: 'UI Components',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'packaging',
          title: 'Packaging',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'all_inbox', // packaging = boxes
          url: '/packaging'
        }
      ]
    },
    // {
    //   id: 'ui-element',
    //   title: 'Payment Methods',
    //   subtitle: 'UI Components',
    //   type: 'group',
    //   icon: 'icon-ui',
    //   children: [
    //     {
    //       id: 'paymentsMethods',
    //       title: 'Payment Methods',
    //       type: 'item',
    //       icon: 'material-icons-two-tone',
    //       iconname: 'payment',
    //       url: '/paymentsMethods'
    //     }
    //   ]
    // },
    // {
    //   id: 'ui-element',
    //   title: 'Coupons',
    //   subtitle: 'UI Components',
    //   type: 'group',
    //   icon: 'icon-ui',
    //   children: [
    //     {
    //       id: 'coupon',
    //       title: 'Coupons',
    //       type: 'item',
    //       icon: 'material-icons-two-tone',
    //       iconname: 'local_offer', // coupon = local offer tag
    //       url: '/coupon'
    //     }
    //   ]
    // },
    {
      id: 'ui-element',
      title: 'Elements',
      subtitle: 'UI Components',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'color',
          title: 'Color',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'palette',
          url: '/colors'
        }
      ]
    }
  ]
};

export default menuItems;
